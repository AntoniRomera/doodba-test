/** @odoo-module **/

import {Component} from "@odoo/owl";

export class TimelineGridRenderer extends Component {}

TimelineGridRenderer.template = "hms_web_timeline_grid.TimelineGridRenderer";

TimelineGridRenderer.headerTemplate =
    "hms_web_timeline_grid.TimelineGridRenderer.Header";
TimelineGridRenderer.rowsTemplate = "hms_web_timeline_grid.TimelineGridRenderer.Rows";
TimelineGridRenderer.recordRowTemplate =
    "hms_web_timeline_grid.TimelineGridRenderer.RecordRow";

TimelineGridRenderer.components = {};
