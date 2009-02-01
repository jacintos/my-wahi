# -*- coding: utf-8 -*-

import web
from controllers import *

urls = (
    '/', 'index',
    '/about', 'about',
    '/privacy', 'privacy',
    '/api', 'api',
    '/loc/(.*)', 'location',
    '/place', 'place',
    '/place/abusive/(\d+)', 'abusive',
    '/place/recent', 'recent',    
    '/place/tags/(\d+)', 'addtags',
    '/place/within', 'within',
    '/place/(\d+)', 'place',
    '/tag/([\w\s]+)', 'tag',
)

app = web.application(urls, globals())


if __name__ == '__main__':
    main = app.cgirun()
