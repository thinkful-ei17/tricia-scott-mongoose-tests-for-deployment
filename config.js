'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/test-blog-app' || 'mongodb://dev:dev@ds251277.mlab.com:51277/blog-app-scott';
exports.PORT = process.env.PORT || 8080;