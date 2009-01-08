# -*- coding: utf-8 -*-

import web
from web.contrib.template import render_mako

#web.config.debug = False

urls = (
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


if __name__ == '__main__':
    main = app.cgirun()
