import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class View(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(
        selection_add=[("timelineGrid", "Timeline Grid")],
        ondelete={"timelineGrid": "cascade"},
    )

    def _is_qweb_based_view(self, view_type):
        qweb_base_view = super()._is_qweb_based_view(view_type)

        return qweb_base_view or view_type in ("timelineGrid")


class IrActionsActWindowView(models.Model):
    _inherit = "ir.actions.act_window.view"

    view_mode = fields.Selection(
        selection_add=[("timelineGrid", "Timeline Grid")],
        ondelete={"timelineGrid": "cascade"},
    )
