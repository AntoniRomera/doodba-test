/** @odoo-module **/
import {
    ActionMenus,
    STATIC_ACTIONS_GROUP_NUMBER,
} from "@web/search/action_menus/action_menus";
import {Layout} from "@web/search/layout";
import {ViewButton} from "@web/views/view_button/view_button";
import {MultiRecordViewButton} from "@web/views/view_button/multi_record_view_button";
import {useService} from "@web/core/utils/hooks";
import {makeContext} from "@web/core/context";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {CogMenu} from "@web/search/cog_menu/cog_menu";
import {standardViewProps} from "@web/views/standard_view_props";
import {useModel} from "@web/model/model";
import {
    addFieldDependencies,
    extractFieldsFromArchInfo,
} from "@web/model/relational_model/utils";
import {useSearchBarToggler} from "@web/search/search_bar/search_bar_toggler";
import {browser} from "@web/core/browser/browser";
import {DateTimePicker} from "@web/core/datetime/datetime_picker";
import {isX2Many} from "@web/views/utils";
import {registry} from "@web/core/registry";
import {createElement, parseXML} from "@web/core/utils/xml";

import {TimelineGridFilterPanel} from "./filter_panel/timeline_grid_filter_panel.esm";
import {TimelineGridMobileFilterPanel} from "./mobile_filter_panel/timeline_grid_mobile_filter_panel.esm";

const {DateTime} = luxon;
const viewRegistry = registry.category("views");

import {
    Component,
    onMounted,
    onWillPatch,
    onWillStart,
    useEffect,
    useRef,
    useState,
    useSubEnv,
} from "@odoo/owl";

export async function loadSubViews(
    fieldNodes,
    fields,
    context,
    resModel,
    viewService,
    userService,
    isSmall
) {
    for (const fieldInfo of Object.values(fieldNodes)) {
        const fieldName = fieldInfo.name;
        const field = fields[fieldName];
        if (!isX2Many(field)) {
            continue; // what follows only concerns x2many fields
        }
        if (fieldInfo.invisible === "True" || fieldInfo.invisible === "1") {
            continue; // no need to fetch the sub view if the field is always invisible
        }
        if (!fieldInfo.field.useSubView) {
            continue; // the FieldComponent used to render the field doesn't need a sub view
        }

        fieldInfo.views = fieldInfo.views || {};
        let viewType = fieldInfo.viewMode || "list,kanban";
        viewType = viewType.replace("tree", "list");
        if (viewType.includes(",")) {
            viewType = isSmall ? "kanban" : "list";
        }
        fieldInfo.viewMode = viewType;
        if (fieldInfo.views[viewType]) {
            continue; // the sub view is inline in the main form view
        }

        // extract *_view_ref keys from field context, to fetch the adequate view
        const fieldContext = {};
        const regex = /'([a-z]*_view_ref)' *: *'(.*?)'/g;
        let matches;
        while ((matches = regex.exec(fieldInfo.context)) !== null) {
            fieldContext[matches[1]] = matches[2];
        }
        // filter out *_view_ref keys from general context
        const refinedContext = {};
        for (const key in context) {
            if (key.indexOf("_view_ref") === -1) {
                refinedContext[key] = context[key];
            }
        }
        // specify the main model to prevent access rights defined in the context
        // (e.g. create: 0) to apply to sub views (same logic as the one applied by
        // the server for inline views)
        refinedContext.base_model_name = resModel;

        const comodel = field.relation;
        const {
            fields: comodelFields,
            relatedModels,
            views,
        } = await viewService.loadViews({
            resModel: comodel,
            views: [[false, viewType]],
            context: makeContext([fieldContext, userService.context, refinedContext]),
        });
        const {ArchParser} = viewRegistry.get(viewType);
        const xmlDoc = parseXML(views[viewType].arch);
        const archInfo = new ArchParser().parse(xmlDoc, relatedModels, comodel);
        fieldInfo.views[viewType] = {
            ...archInfo,
            limit: archInfo.limit || 40,
            fields: comodelFields,
        };
        fieldInfo.relatedFields = comodelFields;
    }
}

export class TimelineGridController extends Component {
    setup() {
        this.viewService = useService("view");
        this.user = useService("user");

        this.archInfo = this.props.archInfo;
        this.display = {...this.props.display};

        const sessionShowSidebar = browser.sessionStorage.getItem(
            "timelineGrid.showSideBar"
        );
        this.state = useState({
            isWeekendVisible:
                browser.localStorage.getItem("timelineGrid.isWeekendVisible") != null
                    ? JSON.parse(
                          browser.localStorage.getItem("timelineGrid.isWeekendVisible")
                      )
                    : true,
            showSideBar:
                !this.env.isSmall &&
                Boolean(
                    sessionShowSidebar != null ? JSON.parse(sessionShowSidebar) : true
                ),
        });

        console.log(this.state);

        const beforeFirstLoad = async () => {
            await loadSubViews(
                this.archInfo.fieldNodes,
                this.props.fields,
                this.props.context,
                this.props.resModel,
                this.viewService,
                this.user,
                this.env.isSmall
            );
            const {activeFields, fields} = extractFieldsFromArchInfo(
                this.archInfo,
                this.props.fields
            );
            if (this.display.controlPanel) {
                addFieldDependencies(activeFields, fields, [
                    {name: "display_name", type: "char", readonly: true},
                ]);
            }
            this.model.config.activeFields = activeFields;
            this.model.config.fields = fields;
        };

        this.model = useState(
            useModel(this.props.Model, this.modelParams, {beforeFirstLoad})
        );
        this.searchBarToggler = useSearchBarToggler();
    }

    /**
     * onWillLoadRoot is a callback that will be executed before (re)loading the
     * data necessary for the root record datapoint. Note that this.model.root
     * may not exist yet at this point, if this is the first load.
     */
    onWillLoadRoot() {
        this.duplicateId = undefined;
    }

    /**
     * onRecordSaved is a callBack that will be executed after the save
     * if it was done. It will therefore not be executed if the record
     * is invalid, if a server error is thrown, or if there are no
     * changes to save.
     * @param {Record} record
     */
    async onRecordSaved(record, changes) {}

    /**
     * onWillSaveRecord is a callBack that will be executed before the
     * record save if the record is valid if the record is valid.
     * If it returns false, it will prevent the save.
     * @param {Record} record
     */
    async onWillSaveRecord() {}

    get showSideBar() {
        return this.state.showSideBar;
    }

    get modelParams() {
        let mode = this.props.mode || "edit";
        if (!this.canEdit && this.props.resId) {
            mode = "readonly";
        }
        return {
            ...this.props.archInfo,
            domain: this.props.domain,
            config: {
                resModel: this.props.resModel,
                resId: this.props.resId || false,
                resIds:
                    this.props.resIds || (this.props.resId ? [this.props.resId] : []),
                fields: this.props.fields,
                activeFields: {}, // will be generated after loading sub views (see willStart)
                isMonoRecord: true,
                mode,
                context: this.props.context,
            },
            state: this.props.state?.modelState,
            hooks: {
                onWillLoadRoot: this.onWillLoadRoot.bind(this),
                onWillSaveRecord: this.onWillSaveRecord.bind(this),
                onRecordSaved: this.onRecordSaved.bind(this),
            },
            useSendBeaconToSaveUrgently: true,
        };
    }

    get showCalendar() {
        return !this.env.isSmall || !this.state.showSideBar;
    }

    get date() {
        return this.model.config.date || DateTime.now();
    }

    get today() {
        return DateTime.now().toFormat("d");
    }

    get currentYear() {
        return this.date.toFormat("y");
    }
    get dayHeader() {
        return `${this.date.toFormat("d")} ${this.date.toFormat("MMMM")} ${
            this.date.year
        }`;
    }

    get datePickerProps() {
        return {
            type: "date",
            showWeekNumbers: false,
            maxPrecision: "days",
            daysOfWeekFormat: "narrow",
            onSelect: (date) => {
                let scale = "week";

                if (this.model.date.hasSame(date, "day")) {
                    const scales = ["week", "day"];
                    scale =
                        scales[(scales.indexOf(this.model.scale) + 1) % scales.length];
                } else {
                    // Check if dates are on the same week
                    // As a.hasSame(b, "week") does not depend on locale and week always starts on Monday,
                    // we are comparing derivated dates instead to take this into account.
                    const currentDate =
                        this.model.date.weekday === 7
                            ? this.model.date.plus({day: 1})
                            : this.model.date;
                    const pickedDate = date.weekday === 7 ? date.plus({day: 1}) : date;

                    // a.hasSame(b, "week") does not depend on locale and week alway starts on Monday
                    if (currentDate.hasSame(pickedDate, "week")) {
                        scale = "day";
                    }
                }

                this.model.load({scale, date});
            },
            value: this.model.date,
        };
    }

    get filterPanelProps() {
        return {
            model: this.model,
        };
    }
    get mobileFilterPanelProps() {
        return {
            model: this.model,
            sideBarShown: this.state.showSideBar,
            toggleSideBar: () => {
                this.state.showSideBar = !this.state.showSideBar;
            },
        };
    }

    get rendererProps() {
        return {
            model: this.model,
            isWeekendVisible: true,
            createRecord: this.createRecord.bind(this),
            deleteRecord: this.deleteRecord.bind(this),
            editRecord: this.editRecord.bind(this),
            setDate: this.setDate.bind(this),
            today: this.today,
        };
    }

    createRecord(record) {}

    async editRecord(record, context = {}, shouldFetchFormViewId = true) {}

    deleteRecord(record) {}

    async setDate(move) {
        let date = null;
        switch (move) {
            case "next":
                date = this.model.date.plus({day: 1});
                break;
            case "previous":
                date = this.model.date.minus({day: 1});
                break;
            case "today":
                date = luxon.DateTime.local().startOf("day");
                break;
        }
        await this.model.load({date});
    }

    toggleSideBar() {
        this.state.showSideBar = !this.state.showSideBar;
        browser.sessionStorage.setItem(
            "timelineGrid.showSideBar",
            this.state.showSideBar
        );
    }
}

TimelineGridController.template = `hms_web_timeline_grid.TimelineGridView`;
TimelineGridController.components = {
    DatePicker: DateTimePicker,
    FilterPanel: TimelineGridFilterPanel,
    MobileFilterPanel: TimelineGridMobileFilterPanel,
    Layout,
    ViewButton,
    MultiRecordViewButton,
    SearchBar,
    CogMenu,
};
TimelineGridController.props = {
    ...standardViewProps,
    allowSelectors: {type: Boolean, optional: true},
    editable: {type: Boolean, optional: true},
    onSelectionChanged: {type: Function, optional: true},
    showButtons: {type: Boolean, optional: true},
    Model: Function,
    Renderer: Function,
    buttonTemplate: String,
    archInfo: Object,
};
TimelineGridController.defaultProps = {
    allowSelectors: true,
    createRecord: () => {},
    editable: true,
    selectRecord: () => {},
    showButtons: true,
};
