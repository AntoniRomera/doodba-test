/** @odoo-module **/

import {Component} from "@odoo/owl";

export class TimelineGridFilterPanel extends Component {}

TimelineGridFilterPanel.template = "hms_web_timeline_grid.TimelineGridFilterPanel";
TimelineGridFilterPanel.subTemplates = {
    filter: "hms_web_timeline_grid.TimelineGridFilterPanel.filter",
};
