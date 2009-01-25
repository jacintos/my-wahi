# -*- coding: utf-8 -*-

import web
from geohash import Geohash
from web.contrib.template import render_mako

#web.config.debug = False

urls = (
    '/loc/(.*)', 'location',
    '/(.*)', 'index',
)

app = web.application(urls, globals())
render_mako2 = render_mako(directories=['templates'],
                           input_encoding='utf-8',
                           output_encoding='utf-8')


def render(path, **kwargs):
    return getattr(render_mako2, path)(**kwargs)


class index(object):

    def GET(self, name):
        return render('main/index')


class location(object):

    def GET(self, loc_hash):
        coords = Geohash(loc_hash).point()
        return render('main/location', coords=coords)


if __name__ == '__main__':
    main = app.cgirun()
