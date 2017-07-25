//require('babel-runtime/core-js/promise').default = require('bluebird')

import './migrations'
import './boot'
import './checkLogin'
import '../../api/server/publications'
import '../../api/server/methods'
import './router'
import '../../api/tasks'
import '../../api/drive'
import '../../api/settings'
import '../../api/projects'
import '../../api/crobjob'
import '../../api/slack'
import '../../api/nylas/methods'
import '../../api/slack/methods'