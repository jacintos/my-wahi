# -*- coding: utf-8 -*-

import web
from controllers import *

urls = (
    '/', 'index',
    '/about', 'about',
    '/privacy', 'privacy',
    '/loc/(.*)', 'location',
    '/place', 'place',
    '/place/(\d+)', 'place',
)

app = web.application(urls, globals())


if __name__ == '__main__':
    main = app.cgirun()
