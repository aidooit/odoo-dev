from odoo import models
from odoo.exceptions import ValidationError


class ResPartner(models.Model):
    _inherit = 'res.partner'

    def action_test_search(self):
        self.search(domain=[('id', '=', self.id)])
        raise ValidationError("This is a test search action.")

    def action_test_search_read(self):
        self.search_read(domain=[('id', '=', self.id)], fields=['name'])
        raise ValidationError("This is a test search read action.")

    def action_test_search_fetch(self):
        self.search_fetch(domain=[('id', '=', self.id)], field_names=['name'])
        raise ValidationError("This is a test search fetch action.")

