import { Component } from "@odoo/owl";
import { Layout } from "@web/search/layout";
import { registry } from "@web/core/registry";
import { DashboardItem } from "./dashboard_item";

class FieldTreeDashboard extends Component {
    static template = "field_trigger_tree.FieldTreeDashboard";
    static components = { Layout, DashboardItem };

    setup() {
        const params = this.props.action.params || {};
    }
}

registry.category("actions").add("field_trigger_tree.dashboard", FieldTreeDashboard);