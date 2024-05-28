/** @odoo-module */
import {archParseBoolean, getActiveActions} from "@web/views/utils";
import {visitXML} from "@web/core/utils/xml";
import {Field} from "@web/views/fields/field";

export class TimelineGridArchParser {
    parse(xmlDoc, models, modelName) {
        console.log(models);
        console.log(modelName);
        const fields = models[modelName];
        const jsClass = xmlDoc.getAttribute("js_class");
        const disableAutofocus = archParseBoolean(
            xmlDoc.getAttribute("disable_autofocus") || ""
        );
        const activeActions = getActiveActions(xmlDoc);
        const fieldNodes = {};
        const fieldNextIds = {};
        const autofocusFieldId = null;

        visitXML(xmlDoc, (node) => {
            if (node.tagName === "field") {
                const fieldInfo = Field.parseFieldNode(
                    node,
                    models,
                    modelName,
                    "timelineGrid",
                    jsClass
                );
                if (!(fieldInfo.name in fieldNextIds)) {
                    fieldNextIds[fieldInfo.name] = 0;
                }
                const fieldId = `${fieldInfo.name}_${fieldNextIds[fieldInfo.name]++}`;
                fieldNodes[fieldId] = fieldInfo;
                node.setAttribute("field_id", fieldId);
                return false;
            }
        });

        console.log({
            activeActions,
            autofocusFieldId,
            disableAutofocus,
            fieldNodes,
            xmlDoc,
            fields,
        });

        return {
            activeActions,
            autofocusFieldId,
            disableAutofocus,
            fieldNodes,
            xmlDoc,
            fields,
        };
    }
}
