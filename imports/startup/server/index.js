//require('babel-runtime/core-js/promise').default = require('bluebird');

import './migrations';
import './boot';
import './slack';
import '../../api/server/publications';
import '../../api/server/methods';
import './router';
import '../../api/tasks/';
