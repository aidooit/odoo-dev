import logging
import requests

from odoo import fields, models

_logger = logging.getLogger(__name__)


class IrModelFields(models.Model):
    _inherit = 'ir.model.fields'

    def action_open_field_trigger_tree(self):
        """Open a new dashboard to visualize the TriggerTree for this field.

        This view renders an OWL component structure that display this tree
        as a visual graph.
        """
        self.ensure_one()
        return {
            'type': 'ir.actions.client',
            'tag': 'field_trigger_tree.dashboard',
            'params': {
                'title': "title",
                'message': "message",
                'type': 'success',
                'sticky': False,
                'model_name': self.model_id.model,
                'field_name': self.name,
            }
        }
    
    def get_field_trigger_tree(self):
        """This method is called from the controller.
        """
        self.ensure_one()
        registry = self.env.registry
        model_id = self.env[self.model_id.model]
        field = model_id._fields[self.name]

        # get TriggerTree info
        info = registry.get_field_trigger_tree(field)

        # convert to JSON serializable format
        tree_json = self._convert_to_json(info, self.model_id.model)
        source_field = f'{self.model_id.model}.{self.name}'

        return {'source_field': source_field, 'trigger_tree': tree_json}

    def _convert_to_json(self, trigger_tree, model_name):
        """Convert the TriggerTree structure to a JSON serializable format.

        Args:
            trigger_tree (TriggerTree): The TriggerTree structure to convert.
            model_name (str): The name of the model.

        Returns:
            dict: JSON serializable representation of the TriggerTree.
        """
        if hasattr(trigger_tree, 'root') and isinstance(trigger_tree, dict):
            # Convert OrderedSet to list for JSON serialization
            root_list = []
            if trigger_tree.root:
                for item in trigger_tree.root:
                    try:
                        # Force convert to string to be safe and remove model prefix
                        root_list.append(str(item).replace(f"{model_name}.", ""))
                    except Exception as e:
                        _logger.error(f"Error converting root item {item} (type: {type(item)}): {e}")
                        root_list.append(f"<unconvertible: {type(item).__name__}>")

            # Process children recursively
            children = {}
            for key, child_tree in trigger_tree.items():
                try:
                    children[str(key)] = self._convert_to_json(child_tree, model_name)
                except Exception as e:
                    _logger.error(f"Error converting child {key}: {e}")
                    children[str(key)] = f"<error: {str(e)}>"

            return {
                "root": root_list,
                "children": children
            }
        else:
            return trigger_tree
