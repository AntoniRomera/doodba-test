import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class View(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(
        selection_add=[("timelineGrid", "Timeline Grid")],
        ondelete={"timelineGrid": "cascade"},
    )


class IrActionsActWindowView(models.Model):
    _inherit = "ir.actions.act_window.view"

    view_mode = fields.Selection(
        selection_add=[("timelineGrid", "Timeline Grid")],
        ondelete={"timelineGrid": "cascade"},
    )
