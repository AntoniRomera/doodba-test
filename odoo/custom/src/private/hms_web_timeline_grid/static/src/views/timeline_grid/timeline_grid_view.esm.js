/** @odoo-module */

import {registry} from "@web/core/registry";
import {TimelineGridRenderer} from "./timeline_grid_renderer.esm";
import {TimelineGridArchParser} from "./timeline_grid_arch_parser.esm";
import {TimelineGridModel} from "./timeline_grid_model.esm";
import {TimelineGridController} from "./timeline_grid_controller.esm";

export const timelineGridView = {
    type: "timelineGrid",
    display_name: "Timeline Grid",
    icon: "oi oi-apps",
    multiRecord: true,
    Controller: TimelineGridController,
    Renderer: TimelineGridRenderer,
    ArchParser: TimelineGridArchParser,
    Model: TimelineGridModel,
    buttonTemplate: "hms_web_timeline_grid.TimelineGridView.Buttons",

    props: (genericProps, view) => {
        const {ArchParser} = view;
        const {arch, relatedModels, resModel} = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            buttonTemplate: view.buttonTemplate,
            archInfo,
        };
    },
};

registry.category("views").add("timelineGrid", timelineGridView);
