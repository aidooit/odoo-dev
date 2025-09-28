{
    'name': 'Field Trigger Tree',
    'version': '1.0',
    'summary': """ Open a dashboard to visualize the TriggerTree for a field.""",
    'author': 'Reinaldo J. Menendez',
    'website': 'https://github.com/rejamen',
    'depends': ['base', 'web'],
    'data': [
        "views/ir_model_fields.xml",
        "views/field_trigger_tree_views.xml",
    ],
    'assets': {
        'web.assets_backend': [
            'field_trigger_tree/static/src/**/*',
        ],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
