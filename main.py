# -*- coding: utf-8 -*-

import web
from controllers import *

web.config.debug = False

urls = (
    '/', 'index',
    '/about', 'about',
    '/privacy', 'privacy',
    '/api', 'api',
    '/loc/(.*)', 'location',
    '/place', 'place',
    '/place/recent', 'recent',
    '/place/within', 'within',
    '/place/(\d+)', 'place',
)

app = web.application(urls, globals())


if __name__ == '__main__':
    main = app.cgirun()
