# -*- coding: utf-8 -*-

from google.appengine.ext import db

__all__ = ['Place']


class Place(db.Model):

    name = db.StringProperty()
    address = db.StringProperty()
    description = db.StringProperty(multiline=True)
    bitly_hash = db.StringProperty()
    geohash = db.StringProperty()
    created_at = db.DateTimeProperty(auto_now_add=True)
