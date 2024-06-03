/** @odoo-module **/

import {Component} from "@odoo/owl";

export class TimelineGridCell extends Component {
    get getStyle() {
        let style = `
            grid-column:${this.props.column} / span ${this.props.column_span};
            grid-row:${this.props.row} / span ${this.props.row_span};
        `;

        if (this.props.weekend) {
            style += `\n background-color:var(--Timeline_grid__DayOff-background-color);`;
        }

        return style;
    }

    get getClass() {
        let _class = "";

        if (this.props.today && !this.props.header) {
            _class += " o_timeline_grid_today";
        }

        if (this.props.hoverable) {
            _class += " o_timeline_grid_hoverable";
        }

        if (this.props.header) {
            _class +=
                " o_gantt_row_header o_gantt_row_sidebar position-relative align-items-center";
        }

        return _class;
    }
}

TimelineGridCell.template = "hms_web_timeline_grid.TimelineGridCell";

TimelineGridCell.headerTemplate = "hms_web_timeline_grid.TimelineGridCell.Header";
TimelineGridCell.normalTemplate = "hms_web_timeline_grid.TimelineGridCell.Normal";

TimelineGridCell.props = {
    row: Number,
    row_span: {type: Number, optional: true},
    header: Boolean,
    text: {type: String, optional: true},
    column: Number,
    column_span: Number,
    today: {type: Boolean, optional: true},
    weekend: {type: Boolean, optional: true},
    hoverable: {type: Boolean, optional: true},
};

TimelineGridCell.defaultProps = {
    row_span: 9,
    weekend: true,
    hoverable: false,
};
