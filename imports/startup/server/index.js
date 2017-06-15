//require('babel-runtime/core-js/promise').default = require('bluebird')
//import './cronjob'

import './migrations'
import './boot'
import './slack'
import './checkLogin'
import '../../api/server/publications'
import '../../api/server/methods'
import './router'
import '../../api/tasks'
import '../../api/drive'
import '../../api/settings'
import '../../api/projects'
