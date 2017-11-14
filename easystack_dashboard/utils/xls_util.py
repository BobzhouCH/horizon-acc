# coding: utf-8
import xlwt

class XLSWriter(object):
    """A XLS writer that produces XLS files from unicode data.
    """
    def __init__(self, file, encoding='utf-8'):
        # must specify the encoding of the input data, utf-8 default.
        self.file = file
        self.encoding = encoding
        self.wbk = xlwt.Workbook()
        self.sheets = {}
        self.header_style = xlwt.easyxf('alignment:horz center,vert center;font: colour black, bold True')
        self.row_style = xlwt.easyxf('alignment:vert center;font: colour black, bold False')

    def add_sheet(self, header, sheet_name='sheet'):
        """add new sheet
        """
        self.sheets[sheet_name] = {'header': header}
        self.sheets[sheet_name]['rows'] = 0
        self.sheets[sheet_name]['sheet'] = self.wbk.add_sheet( sheet_name, cell_overwrite_ok=True)
        self.add_row(header, sheet_name, True)

    def cell(self, s):
        """add cell"""
        if isinstance(s, basestring):
            if not isinstance(s, unicode):
                s = s.decode(self.encoding)
        elif s is None:
            s = ''
        else:
            s = str(s)
        return s

    def add_row(self, row, sheet_name='sheet', header=False):
        """add row"""
        if sheet_name not in self.sheets.keys():
            return

        xfstyle = self.header_style if header else self.row_style
        for row_col, value in enumerate(row):
                self.sheets[sheet_name]['sheet'].write(
                    self.sheets[sheet_name]['rows'], row_col, self.cell(value), xfstyle)
        self.sheets[sheet_name]['rows'] += 1

    def add_rows(self, rows, sheet_name='sheet', header=False):
        """add multi row"""
        if rows == None:
            return
        for row in rows:
            self.add_row(row, sheet_name, header)

    def save(self):
        """save"""
        self.wbk.save(self.file)
