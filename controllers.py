# -*- coding: utf-8 -*-

import cgi, web
from datetime import datetime
from django.utils import simplejson 
from geohash import Geohash
from google.appengine.api import urlfetch
from models import Place
from urllib import quote, urlencode
from web.contrib.template import render_mako
from web import form, seeother

__all__ = ['index', 'about', 'privacy', 'location', 'place', 'recent']

render_mako2 = render_mako(directories=['templates'],
                           input_encoding='utf-8',
                           output_encoding='utf-8')


def render(path, **kwargs):
    return getattr(render_mako2, path)(**kwargs)


class index(object):

    def GET(self):
        return render('main/index')


class about(object):

    def GET(self):
        return render('main/about')


class privacy(object):

    def GET(self):
        return render('main/privacy')


class location(object):

    def GET(self, loc_hash):
        coords = Geohash(loc_hash).point()
        return render('main/location', coords=coords)


class place(object):

    myform = form.Form(
        form.Textbox('name'),
        form.Textbox('address'),
        form.Textbox('description'),
        form.Textbox('bitly_login'),
        form.Textbox('bitly_apikey'),
        form.Textbox('longitude'),
        form.Textbox('latitude'))

    mylogin = 'jacintos'
    myapikey = 'R_2555944778356e8a2fa1c15f33b8e3f9'

    def GET(self, model_id):
        place = Place.get_by_id(int(model_id))
        if place is None:
            raise web.webapi.notfound()
        else:
            coords = Geohash(place.geohash).point()
            return render('main/place', place=place, coords=coords)

    def POST(self):
        f = place.myform()
        if f.validates():
            coords = float(f.d.get('longitude')), float(f.d.get('latitude'))
            login = f.d.get('bitly_login') or place.mylogin
            apikey = f.d.get('bitly_apikey') or place.myapikey

            p = Place()
            p.name = cgi.escape(f.d.get('name'))
            p.address = cgi.escape(f.d.get('address'))
            p.description = cgi.escape(f.d.get('description'))
            p.geohash = str(Geohash(coords))
            p.put()

            model_id = p.key().id()
            url = web.ctx.home + '/place/' + str(model_id)
            p.bitly_hash = self._bitly_hash(url, login, apikey)

            if p.bitly_hash is None:
                # Try again in case user's account was junk
                p.bitly_hash = self._bitly_hash(url, place.mylogin,
                                                place.myapikey)
            p.put()
        else:
            raise web.webapi.badrequest()
        raise seeother(url)

    def _bitly_hash(self, url, login, apikey):
        opts = {
            'longUrl' : url,
            'login' : login,
            'apiKey' : apikey,
            'format' : 'json',
            'version' : '2.0.1'
        }
        base = 'http://api.bit.ly/shorten?'
        resp = urlfetch.fetch(base + urlencode(opts))
        if resp.status_code == 200:
            content = simplejson.loads(resp.content)
            if content.get('statusCode') == 'OK':
                return content['results'][url].get('userHash')


class recent(object):

    def GET(self):
        query = Place.all()
        places = query.order('-created_at').fetch(limit=100)
        base_url = web.ctx.home + '/place/'
        for place in places:
            place.url = base_url + str(place.key().id())
            place.long, place.lat = Geohash(place.geohash).point()
            place.updated_at = place.created_at
        web.header('Content-Type', 'application/atom+xml')
        updated_at = datetime.now()
        return render('atom/recent', updated_at=updated_at, places=places)


def my_internal_error():
    return web.internalerror(render('error/500'))


def my_not_found():
    return web.notfound(render('error/404'))


def my_bad_request():
    return web.badrequest(render('error/400'))


web.webapi.internalerror = my_internal_error
web.webapi.notfound = my_not_found
web.webapi.badrequest = my_bad_request
