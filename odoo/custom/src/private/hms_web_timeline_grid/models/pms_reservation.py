import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class Reservation(models.Model):
    _name = "pms.reservation"
    _description = ""

    name = fields.Char()
    arrival_date = fields.Date()
    departure_date = fields.Date()

    room_ids = fields.One2many("pms.reservation.room", "reservation_id")


class ReservationRoom(models.Model):
    _name = "pms.reservation.room"
    _description = ""

    reservation_id = fields.Many2one("pms.reservation")
    date_from = fields.Date()
    date_to = fields.Date()
    room_id = fields.Many2one("pms.room")


class Room(models.Model):
    _name = "pms.room"
    _description = ""

    name = fields.Char()
