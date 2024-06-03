/** @odoo-module **/

import {KeepLast} from "@web/core/utils/concurrency";
import {Model} from "@web/model/model";

import {deserializeDateTime} from "@web/core/l10n/dates";
import {extractFieldsFromArchInfo} from "@web/model/relational_model/utils";
import {localization} from "@web/core/l10n/localization";

const {Interval, DateTime} = luxon;

export class TimelineGridModel extends Model {
    setup(params, services) {
        /** @protected */
        this.user = services.user;

        /** @protected */
        this.keepLast = new KeepLast();

        const formViewFromConfig = (this.env.config.views || []).find(
            (view) => view[1] === "form"
        );
        const formViewIdFromConfig = formViewFromConfig ? formViewFromConfig[0] : false;
        console.log(params);
        const fieldNodes = params.fieldNodes;
        const {activeFields, fields} = extractFieldsFromArchInfo(
            {fieldNodes},
            params.fields
        );
        this.config = {
            ...params,
            activeFields,
            fields,
            firstDayOfWeek: (localization.weekStart || 0) % 7,
            formViewId: params.formViewId || formViewIdFromConfig,
        };
        this.data = {
            filters: {},
            filterSections: {},
            hasCreateRight: null,
            range: null,
            records: {},
            unusualDays: [],
        };
    }
    get date() {
        return this.config.date;
    }
    get rangeEnd() {
        return this.data.range.end;
    }
    get rangeLocalEnd() {
        return this.data.range.end.toLocaleString(DateTime.DATE_FULL);
    }
    get columns() {
        return this.data.range.columns;
    }
    get rangeStart() {
        return this.data.range.start;
    }
    get rangeLocalStart() {
        return this.data.range.start.toLocaleString(DateTime.DATE_FULL);
    }

    async load(params = {}) {
        Object.assign(this.config, params);
        if (!this.config.date) {
            this.config.date =
                params.context && params.context.initial_date
                    ? deserializeDateTime(params.context.initial_date)
                    : luxon.DateTime.local();
        }
        // Prevent picking a scale that is not supported by the view
        const data = {...this.data};
        await this.keepLast.add(this.updateData(data));
        this.data = data;
        this.notify();
    }
    /**
     * @protected
     * @param {Object} data .
     * @returns null
     */
    async updateData(data) {
        // If (data.hasCreateRight === null) {
        //     data.hasCreateRight = await this.orm.call(this.meta.resModel, "check_access_rights", [
        //         "create",
        //         false,
        //     ]);
        // }
        data.range = this.computeRange();
        // If (this.meta.showUnusualDays) {
        //     data.unusualDays = await this.loadUnusualDays(data);
        // }

        // const { sections, dynamicFiltersInfo } = await this.loadFilters(data);

        // // Load records and dynamic filters only with fresh filters
        // data.filterSections = sections;
        // data.records = await this.loadRecords(data);
        // const dynamicSections = await this.loadDynamicFilters(data, dynamicFiltersInfo);

        // // Apply newly computed filter sections
        // Object.assign(data.filterSections, dynamicSections);

        // // Remove records that don't match dynamic filters
        // for (const [recordId, record] of Object.entries(data.records)) {
        //     for (const [fieldName, filterInfo] of Object.entries(dynamicSections)) {
        //         for (const filter of filterInfo.filters) {
        //             const rawValue = record.rawRecord[fieldName];
        //             const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
        //             if (filter.value === value && !filter.active) {
        //                 delete data.records[recordId];
        //             }
        //         }
        //     }
        // }
    }
    /**
     * @protected
     * @returns {Object} start, end, columns
     */
    computeRange() {
        const {date} = this.config;
        let start = date;
        let end = date;

        let days = 20;

        if (this.env.isSmall) {
            days = 7;
        }

        end = start.plus({days: days});

        end = end.endOf("day");
        start = start.startOf("day");

        const dates = Interval.fromDateTimes(start, end)
            .splitBy({day: 1})
            .map((process_date) => process_date.start);

        const columns = [];
        for (const process_date of Object.entries(Object.assign({}, dates))) {
            columns.push({
                index: parseInt(process_date[0], 10),
                column: parseInt(process_date[0], 10) + 1,
                date: process_date[1],
                weekend: [5, 6, 7].includes(process_date[1].weekday),
            });
        }

        return {start, end, columns};
    }
}

TimelineGridModel.services = ["user", "rpc"];
