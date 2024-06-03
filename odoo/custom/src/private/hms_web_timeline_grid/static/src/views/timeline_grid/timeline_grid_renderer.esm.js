/** @odoo-module **/

import {Component} from "@odoo/owl";
import {TimelineGridCell} from "./components/timeline_grid_cell/timeline_grid_cell.esm";
import {TimelineGridRowColumn} from "./components/timeline_grid_row_column/timeline_grid_row_column.esm";
import {TimelineGridRowHeader} from "./components/timeline_grid_row_header/timeline_grid_row_header.esm";

export class TimelineGridRenderer extends Component {
    get getStyle() {
        return `
            --Timeline_grid__RowHeader-width: 100px;
            --Timeline_grid__Pill-height: 35px;
            --Timeline_grid__Row-height: 4px;
            --Timeline_grid__Template-rows: 1;
            --Timeline_grid__Template-columns: ${this.props.model.columns.length};
        `;
    }
}

TimelineGridRenderer.template = "hms_web_timeline_grid.TimelineGridRenderer";

TimelineGridRenderer.headerTemplate =
    "hms_web_timeline_grid.TimelineGridRenderer.Header";
TimelineGridRenderer.rowTemplate = "hms_web_timeline_grid.TimelineGridRenderer.Rows";
TimelineGridRenderer.recordRowTemplate =
    "hms_web_timeline_grid.TimelineGridRenderer.RecordRow";
TimelineGridRenderer.rowHeaderTemplate =
    "hms_web_timeline_grid.TimelineGridRenderer.RowHeader";
TimelineGridRenderer.components = {
    TimelineGridRowColumn,
    TimelineGridRowHeader,
    TimelineGridCell,
};
