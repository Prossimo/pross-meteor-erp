Promise = require('bluebird')

/*
 * Remove some annoyed warnings
 * */
if (Meteor.isClient) {
    Promise.config({
        warnings: false,
    })
}

const logger = require('/imports/utils/logger')
ServerLog = logger.ServerLog
ServerErrorLog = logger.ServerErrorLog
ClientErrorLog = logger.ClientErrorLog
MeteorErrorLog = logger.MeteorErrorLog
ErrorLog = logger.ErrorLog
