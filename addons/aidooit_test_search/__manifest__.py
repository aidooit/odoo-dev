{
    'name': "Aidooit: Test record search options",

    'summary': "Test different Odoo search options for records",

    'description': """
In this module we will test different search options for records in Odoo, with special focus
on the SQL impact.
    """,
    'author': "aidooit",
    'website': "https://www.aidooit.com",
    'category': 'Uncategorized',
    'version': '1.0',
    'depends': ['base'],
    "data": [
        "security/ir.model.access.csv",
        "views/res_partner.xml",
        "views/test_model.xml"
    ],
}

