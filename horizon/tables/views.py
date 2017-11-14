# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

import json
import types

from collections import defaultdict

from django.contrib import messages
from django.http import HttpResponse  # noqa
from django import shortcuts
from django.template.loader import render_to_string
from django.utils import encoding
from django.utils import functional
from django.views import generic

from horizon.tables import actions as horizon_actions
from horizon.tables import Column  # noqa
from horizon import views
from horizon.templatetags.horizon import has_permissions  # noqa


class MultiTableMixin(object):
    """A generic mixin which provides methods for handling DataTables."""
    data_method_pattern = "get_%s_data"

    def __init__(self, *args, **kwargs):
        super(MultiTableMixin, self).__init__(*args, **kwargs)
        self.table_classes = getattr(self, "table_classes", [])
        self._data = {}
        self._tables = {}

        self._data_methods = defaultdict(list)
        self.get_data_methods(self.table_classes, self._data_methods)

    def _get_data_dict(self):
        if not self._data:
            for table in self.table_classes:
                data = []
                name = table._meta.name
                func_list = self._data_methods.get(name, [])
                for func in func_list:
                    data.extend(func())
                self._data[name] = data
        return self._data

    def get_data_methods(self, table_classes, methods):
        for table in table_classes:
            name = table._meta.name
            if table._meta.mixed_data_type:
                for data_type in table._meta.data_types:
                    func = self.check_method_exist(self.data_method_pattern,
                                                   data_type)
                    if func:
                        type_name = table._meta.data_type_name
                        methods[name].append(self.wrap_func(func,
                                                            type_name,
                                                            data_type))
            else:
                func = self.check_method_exist(self.data_method_pattern,
                                               name)
                if func:
                    methods[name].append(func)

    def wrap_func(self, data_func, type_name, data_type):
        def final_data():
            data = data_func()
            self.assign_type_string(data, type_name, data_type)
            return data
        return final_data

    def check_method_exist(self, func_pattern="%s", *names):
        func_name = func_pattern % names
        func = getattr(self, func_name, None)
        if not func or not callable(func):
            cls_name = self.__class__.__name__
            raise NotImplementedError("You must define a %s method "
                                      "in %s." % (func_name, cls_name))
        else:
            return func

    def assign_type_string(self, data, type_name, data_type):
        for datum in data:
            setattr(datum, type_name, data_type)

    def get_tables(self):
        if not self.table_classes:
            raise AttributeError('You must specify one or more DataTable '
                                 'classes for the "table_classes" attribute '
                                 'on %s.' % self.__class__.__name__)
        if not self._tables:
            for table in self.table_classes:
                if not has_permissions(self.request.user,
                                       table._meta):
                    continue
                func_name = "get_%s_table" % table._meta.name
                table_func = getattr(self, func_name, None)
                if table_func is None:
                    tbl = table(self.request, **self.kwargs)
                else:
                    tbl = table_func(self, self.request, **self.kwargs)
                self._tables[table._meta.name] = tbl
        return self._tables

    def get_context_data(self, **kwargs):
        context = super(MultiTableMixin, self).get_context_data(**kwargs)
        tables = self.get_tables()
        for name, table in tables.items():
            context["%s_table" % name] = table
        return context

    def has_prev_data(self, table):
        return False

    def has_more_data(self, table):
        return False

    def handle_table(self, table):
        name = table.name
        data = self._get_data_dict()
        self._tables[name].data = data[table._meta.name]
        self._tables[name]._meta.has_more_data = self.has_more_data(table)
        self._tables[name]._meta.has_prev_data = self.has_prev_data(table)
        handled = self._tables[name].maybe_handle()
        return handled


class MultiTableView(MultiTableMixin, views.HorizonTemplateView):
    """A class-based generic view to handle the display and processing of
    multiple :class:`~horizon.tables.DataTable` classes in a single view.

    Three steps are required to use this view: set the ``table_classes``
    attribute with a tuple of the desired
    :class:`~horizon.tables.DataTable` classes;
    define a ``get_{{ table_name }}_data`` method for each table class
    which returns a set of data for that table; and specify a template for
    the ``template_name`` attribute.

    .. attribute:: show_breadcrumb

        Shows breadcrumb for this view if value is true.
        Uses the view's request path for determining breadcrumb hierarchy.
        Defaults to true.

    """
    show_breadcrumb = True

    def construct_tables(self):
        tables = self.get_tables().values()
        # Early out before data is loaded
        for table in tables:
            preempted = table.maybe_preempt()
            if preempted:
                return preempted
        # Load data into each table and check for action handlers
        for table in tables:
            handled = self.handle_table(table)
            if handled:
                return handled

        # If we didn't already return a response, returning None continues
        # with the view as normal.
        return None

    def get(self, request, *args, **kwargs):
        handled = self.construct_tables()
        if handled:
            return handled
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        # GET and POST handling are the same
        return self.get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(MultiTableView, self).get_context_data(**kwargs)
        if self.show_breadcrumb:
            from horizon.browsers import Breadcrumb
            context["breadcrumb"] = Breadcrumb(self.request)
        return context


class DataTableView(MultiTableView):
    """A class-based generic view to handle basic DataTable processing.

    Three steps are required to use this view: set the ``table_class``
    attribute with the desired :class:`~horizon.tables.DataTable` class;
    define a ``get_data`` method which returns a set of data for the
    table; and specify a template for the ``template_name`` attribute.

    Optionally, you can override the ``has_more_data`` method to trigger
    pagination handling for APIs that support it.
    """
    table_class = None
    context_object_name = 'table'

    def _get_data_dict(self):
        if not self._data:
            self.update_server_filter_action()
            self._data = {self.table_class._meta.name: self.get_data()}
        return self._data

    def get_data(self):
        return []

    def get_tables(self):
        if not self._tables:
            self._tables = {}
            if has_permissions(self.request.user,
                               self.table_class._meta):
                self._tables[self.table_class._meta.name] = self.get_table()
        return self._tables

    def get_table(self):
        # Note: this method cannot be easily memoized, because get_context_data
        # uses its cached value directly.
        if not self.table_class:
            raise AttributeError('You must specify a DataTable class for the '
                                 '"table_class" attribute on %s.'
                                 % self.__class__.__name__)
        if not hasattr(self, "table"):
            self.table = self.table_class(self.request, **self.kwargs)
        return self.table

    def get_context_data(self, **kwargs):
        context = super(DataTableView, self).get_context_data(**kwargs)
        if hasattr(self, "table"):
            context[self.context_object_name] = self.table
        return context

    def post(self, request, *args, **kwargs):
        # If the server side table filter changed then go back to the first
        # page of data. Otherwise GET and POST handling are the same.
        if self.handle_server_filter(request):
            return shortcuts.redirect(self.get_table().get_absolute_url())
        return self.get(request, *args, **kwargs)

    def get_server_filter_info(self, request):
        filter_action = self.get_table()._meta._filter_action
        if filter_action is None or filter_action.filter_type != 'server':
            return None
        param_name = filter_action.get_param_name()
        filter_string = request.POST.get(param_name)
        filter_string_session = request.session.get(param_name, "")
        changed = (filter_string is not None
                   and filter_string != filter_string_session)
        if filter_string is None:
            filter_string = filter_string_session
        filter_field_param = param_name + '_field'
        filter_field = request.POST.get(filter_field_param)
        filter_field_session = request.session.get(filter_field_param)
        if filter_field is None and filter_field_session is not None:
            filter_field = filter_field_session
        filter_info = {
            'action': filter_action,
            'value_param': param_name,
            'value': filter_string,
            'field_param': filter_field_param,
            'field': filter_field,
            'changed': changed
        }
        return filter_info

    def handle_server_filter(self, request):
        """Update the table server filter information in the session and
        determine if the filter has been changed.
        """
        filter_info = self.get_server_filter_info(request)
        if filter_info is None:
            return False
        request.session[filter_info['value_param']] = filter_info['value']
        if filter_info['field_param']:
            request.session[filter_info['field_param']] = filter_info['field']
        return filter_info['changed']

    def update_server_filter_action(self):
        """Update the table server side filter action based on the current
        filter. The filter info may be stored in the session and this will
        restore it.
        """
        filter_info = self.get_server_filter_info(self.request)
        if filter_info is not None:
            action = filter_info['action']
            setattr(action, 'filter_string', filter_info['value'])
            if filter_info['field_param']:
                setattr(action, 'filter_field', filter_info['field'])


class MixedDataTableView(DataTableView):
    """A class-based generic view to handle DataTable with mixed data
    types.

    Basic usage is the same as DataTableView.

    Three steps are required to use this view:
    #. Set the ``table_class`` attribute with desired
    :class:`~horizon.tables.DataTable` class. In the class the
    ``data_types`` list should have at least two elements.

    #. Define a ``get_{{ data_type }}_data`` method for each data type
    which returns a set of data for the table.

    #. Specify a template for the ``template_name`` attribute.
    """
    table_class = None
    context_object_name = 'table'

    def _get_data_dict(self):
        if not self._data:
            table = self.table_class
            self._data = {table._meta.name: []}
            for data_type in table.data_types:
                func_name = "get_%s_data" % data_type
                data_func = getattr(self, func_name, None)
                if data_func is None:
                    cls_name = self.__class__.__name__
                    raise NotImplementedError("You must define a %s method "
                                              "for %s data type in %s." %
                                              (func_name, data_type, cls_name))
                data = data_func()
                self.assign_type_string(data, data_type)
                self._data[table._meta.name].extend(data)
        return self._data

    def assign_type_string(self, data, type_string):
        for datum in data:
            setattr(datum, self.table_class.data_type_name,
                    type_string)

    def get_table(self):
        self.table = super(MixedDataTableView, self).get_table()
        if not self.table._meta.mixed_data_type:
            raise AttributeError('You must have at least two elements in '
                                 'the data_types attribute '
                                 'in table %s to use MixedDataTableView.'
                                 % self.table._meta.name)
        return self.table


class TableEncoder(json.JSONEncoder):
    """This class handles serialization of horizon table type classes
    such as the actions and columns
    """
    def default(self, obj):
        # Serialize columns and actions
        # Forward to view for handling
        if isinstance(obj, Column):
            return self.get_column_json(obj)
        elif isinstance(obj, horizon_actions.BaseAction):
            return self.get_action_json(obj)

        # This section covers lazy loaded strings like u"-"
        elif isinstance(obj, functional.Promise):
            return encoding.force_text(obj)

        # There are collection of classes like glance
        # which need to be serialized in another way
        else:
            try:
                return json.JSONEncoder.default(self, obj)
            except Exception:
                return obj.__dict__

    def get_column_json(self, column):
        """Gets the content of a single column.
        Yields the following format: {
          name: column verbose name,
          statusChoices: column status choices if available,
          displayChocies: column display choices if available
          class: the column class (css) string
        }
        """
        results = {'name': column.verbose_name}
        if column.status and column.status_choices:
            results['statusChoices'] = dict(column.status_choices)
        if column.display_choices:
            results['displayChoices'] = dict(column.display_choices)
        # Ideally class_string should not propagate to client
        # but it is currently required for sorting to work properly
        # because we still rely on the horizon.table.js wrapper
        results['class'] = column.class_string
        return results

    def get_action_json(self, action):
        """Gets the content of a single action.
        Yields the following format: {
          id: id of this action,
          verbose_name: verbose name of action if applicable,
          verbose_name_plural: plural verbose name if applicable,
          type: action base type,
          url: action url (link actions only),
          classes: string of classes
          icon: the icon for the action (if present)
        }
        """
        action_type_map = {horizon_actions.BatchAction: "BatchAction",
                           horizon_actions.DeleteAction: "DeleteAction",
                           horizon_actions.FilterAction: "FilterAction",
                           horizon_actions.FixedFilterAction:
                           "FixedFilterAction",
                           horizon_actions.LinkAction: "LinkAction",
                           horizon_actions.UpdateAction: "UpdateAction"}

        results = {'verbose_name': getattr(action, "verbose_name", None),
                   'name': getattr(action, "name", None),
                   'classes': action.get_final_attrs()['class']}

        # Get the action icon
        if hasattr(action, 'icon'):
            results['icon'] = action.icon

        # Get the action type
        for action_type in action_type_map:
            if isinstance(action, action_type):
                results['type'] = action_type_map[action_type]
                break
        if 'type' not in results:
            results['type'] = action.__class__.__name__

        # Get verbose names for batch actions
        if isinstance(action, horizon_actions.BatchAction):
            results['verbose_name'] = action._get_action_name()
            results['verbose_name_plural'] = action.\
                _get_action_name(items=[1, 2])

        # Get the action url if action type is link
        if isinstance(action, horizon_actions.LinkAction):
            results['url'] = action.get_link_url(action.datum)

        # Get the action id
        action_param = getattr(action, 'get_param_name', None)
        if callable(action_param):
            results['id'] = action.get_param_name()
        elif getattr(action, "datum", None):
            results['id'] = "%s__%s__%s" % \
                (action.table.name, getattr(action, "name", None),
                 action.table.get_object_id(action.datum))
        return results


class JSONTableMixin(MultiTableView):
    """Mixin to easily add json endpoints for table views.
    Subclasses will likely need a different encoder if there are
    specialized classes. The intent of this mixin is to provide angularJS
    with JSON responses to allow rendering on client-side.
    """
    encoder_class = TableEncoder

    def get(self, request, *args, **kwargs):
        """Intercept all incoming requests that contain json requests."""
        params = request.GET
        if "format" in params and params.get("format") == "json":
            # Intercept AJAX row update requests here
            """if "action" in params and params.get("action") == "row_update":
                return self.handle_row_update(request)"""
            # Intercept Angular-directive requests here
            if "directive" in params:
                if params.get("directive") == "row_actions":
                    return self.get_row_action_directive()
                elif params.get("directive") == "table_actions":
                    return self.get_table_action_directive()
            # Serialize the entire table as JSON
            else:
                tablemap = self.get_table_dict()
                from django.contrib import messages
                msgs = messages.get_messages(request)
                tablemap['messages'] = [msg.__dict__ for msg in msgs]
                return HttpResponse(json.dumps(tablemap,
                                               cls=self.encoder_class),
                                    content_type='application/json')
        else:
            return super(JSONTableMixin, self).get(request, args, kwargs)

    def get_table_action_directive(self):
        template = "easystack_dashboard/angular/_table_actions.html"
        return HttpResponse(render_to_string(template))

    def get_row_action_directive(self):
        template = "easystack_dashboard/angular/_table_row_actions.html"
        return HttpResponse(render_to_string(template))

    def get_table(self):
        """Override the default rendering of row update."""
        def create_row_render(view):
            def row_render(self, row):
                row_content = view.get_row_content(self, row)
                content = json.dumps(row_content, cls=view.encoder_class)
                return HttpResponse(content, content_type='application/json')
            return row_render
        import types
        self.table = super(JSONTableMixin, self).get_table()
        self.table.row_render = types.MethodType(create_row_render(self),
                                                 self.table)
        return self.table

    def get_table_dict(self):
        """Gets the content of all tables.
        Yields a list of dict object with following format: {
          name: table name,
          actions: list of actions,
          columns: list of columns,
          rows: list of rows
        }
        """
        self.construct_tables()
        tables = self.get_tables()
        tablemap = {}
        table_list = []
        for table_name in tables.keys():
            table_dict = {'name': table_name}
            table = tables[table_name]
            table_dict['actions'] = table.get_table_actions()
            table_dict['columns'] = table.get_columns()
            table_dict['has_more_data'] = self.has_more_data(table)
            table_dict['rows'] = list(self.get_table_data(table))
            table_list.append(table_dict)
        tablemap['tables'] = table_list
        return tablemap

    def get_table_data(self, table):
        """Gets the content of all rows in this table."""
        table_rows = table.get_rows()
        ignore_cols = ['multi_select', 'actions']
        for row in table_rows:
            if hasattr(row, "datum") and row.datum:
                yield self.get_row_content(table, row, ignore_cols)

    def get_row_content(self, table, row, ignore_cols=[]):
        """Gets the content of a single row.
        Yields a dict with following format: {
          id: unique row id,
          data-display: row display (not used),
          data-object-id: row object id,
          data-update-interval: row update interval,
          data-update-url: row update url,
          data: raw data object,
          cells: list of display values,
          actions: list of row actions
        }
        """
        datum = row.datum
        content = row.attrs
        content.update({'actions': table.get_row_actions(datum),
                        'data': datum})
        # cells is needed when users want to bind final display value
        # generated by the column transform as oppose to raw data
        content['cells'] = dict((cell.column.name,
                                 unicode(cell.column.get_data(datum)))
                                for cell in row
                                if cell.column.name not in ignore_cols)
        # behavior should be data driven, as oppose to css driven
        if 'status_unknown' in row.class_string:
            content['requiresPolling'] = True
        return content
