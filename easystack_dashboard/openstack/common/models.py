PRODUCT_STATUS = {'deleted': -1, 'disable': 0, 'active': 1,
                  'suspend': 2, 'stop': 3}


class Query():

    def set_query(self, query, number, count, order_by, sort):
        self.query = query
        self.number = number
        self.count = count
        self.order_by = order_by
        self.sort = sort

    def get_start(self):
        return (self.number - 1) * self.count

    def get_end(self):
        return self.number * self.count


class Result():

    def __init__(self, results, total, query):
        self.results = results
        self.query = query
        self.total = total


class Base():

    def __init__(self, pid):
        self.id = pid


class Account(Base):

    def __init__(self, pid, name, balance, ref_resource):
        Base.__init__(self, pid)
        self.name = name
        self.balance = balance
        self.ref_resource = ref_resource


class Product(Base):

    def __init__(self, pid, resource_id, fee, status, ptype, cost,
                 unit, provider, update_at, account_id, version):
        Base.__init__(self, pid)
        self.resource_id = resource_id
        self.fee = fee
        self.cost = cost
        self.unit = unit
        self.provider = provider
        self.update_at = update_at
        self.account_id = account_id
        self.status = status
        self.ptype = ptype
        self.version = version

    def __repr__(self):
        return "<Product(id:'%s', update_at: '%s', stauts:'%s', type:'%s')>" %\
            (self.id, self.update_at, self.status, self.ptype)


class billingItem(Base):

    def __init__(self, pid, charge_from, charge_to, charge_fee, product_id):
        Base.__init__(self, pid)
        self.charge_from = charge_from
        self.charge_to = charge_to
        self.charge_fee = charge_fee
        self.product_id = product_id


class Price(Base):

    def __init__(self, pid, name, ptype, account_id):
        Base.__init__(self, pid)
        self.name = name
        self.ptype = ptype
        self.account_id = account_id


class PriceItem(Base):

    def __init__(self, pid, rule, ptype, fee, unit, price_id):
        Base.__init__(self, pid)
        self.rule = rule
        self.ptype = ptype
        self.fee = fee
        self.unit = unit
        self.price_id = price_id


class Payment(Base):

    def __init__(self, pid, pay_at, amount, ptype, account_id):
        Base.__init__(self, pid)
        self.pay_at = pay_at
        self.ptype = ptype
        self.amount = amount
        self.account_id = account_id
