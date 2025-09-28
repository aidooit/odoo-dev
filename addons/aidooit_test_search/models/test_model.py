from odoo import fields, models
from odoo.exceptions import ValidationError


class TestModel(models.Model):
    _name = 'test.model'

    name = fields.Char()
    email = fields.Char()
    phone = fields.Char()
    job = fields.Char()
    age = fields.Integer()

    def action_test_search(self):
        self.search(domain=[('id', '=', self.id)])
        # raise ValidationError("This is a test search action.")

    def action_test_search_read(self):
        self.search_read(domain=[('id', '=', self.id)], fields=['name'])
        # raise ValidationError("This is a test search read action.")

    def action_test_search_fetch(self):
        self.search_fetch(domain=[('id', '=', self.id)], field_names=['name'])
        # raise ValidationError("This is a test search fetch action.")