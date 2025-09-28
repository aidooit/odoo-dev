
from odoo import http
from odoo.http import request
from odoo.exceptions import ValidationError


class FieldTreeDashboard(http.Controller):
    @http.route('/field_trigger_tree', type='jsonrpc', auth='user')
    def get_statistics(self, model_name, field_name):
        field_id = request.env['ir.model.fields'].search([
            ('model_id.model', '=', model_name),
            ('name', '=', field_name)
        ])
        if not field_id:
            raise ValidationError("Field not found")
        return field_id.get_field_trigger_tree()
