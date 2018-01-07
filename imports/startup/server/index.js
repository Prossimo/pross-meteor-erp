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
import '../../api/crobjob'
import '../../api/slack'
import {ServerErrorLog, MeteorErrorLog, ErrorLog} from '/imports/utils/logger'

/*process.on('uncaughtException', (err) => {
    //ServerErrorLog.error('Server Crashed!', err)
    console.error(err.stack)
    process.exit(7)
})*/

// store original Meteor error
/*const originalMeteorDebug = Meteor._debug

Meteor._debug = (message, stack) => { console.log('========>Meteor Error',message, stack)
    const error = new Error(message)
    error.stack = stack
    MeteorErrorLog.error(message, error)
    return originalMeteorDebug.apply(this, arguments)
}*/

ServerErrorLog.error('Server error logging test')
MeteorErrorLog.error('Meteor error logging test')
ErrorLog.error('Error logging test')

