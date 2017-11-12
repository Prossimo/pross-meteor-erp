import fs from 'fs'
import {Logger} from 'meteor/ostrio:logger'
import {LoggerFile} from 'meteor/ostrio:loggerfile'

const logPath = `${Meteor.absolutePath}/logs` // Use absolute storage path

if (Meteor.isServer) {
    if (!fs.existsSync(logPath)) fs.mkdirSync(logPath)
}

    console.log(`====> Logs path: ${Meteor.absolutePath}/logs`)
    export const ErrorLog = new Logger();
    (new LoggerFile(ErrorLog, {
        fileNameFormat(time) {
            return `mavrik-error-${  time.getDate()  }-${  time.getMonth() + 1  }-${  time.getFullYear()  }  }.log`
        },
        format(time, level, message, data, userId) {
            data = JSON.parse(data)
            let logString = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] | "${message}" | User: ${  userId  }\r\n`
            if (data && Object.keys(data).length > 0) logString += `${JSON.stringify(data)}\r\n`
            return logString
        },
        path: logPath
    })).enable()

    export const ServerErrorLog = new Logger();
    (new LoggerFile(ServerErrorLog, {
        fileNameFormat(time) {
            return `mavrik-server-error-${  time.getDate()  }-${  time.getMonth() + 1  }-${  time.getFullYear()  }  }.log`
        },
        format(time, level, message, data, userId) {
            data = JSON.parse(data)
            let logString = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] | "${message}" | User: ${  userId  }\r\n`
            if (data && Object.keys(data).length > 0) logString += `${JSON.stringify(data)}\r\n`
            return logString
        },
        path: logPath
    })).enable()

    export const MeteorErrorLog = new Logger();
    (new LoggerFile(MeteorErrorLog, {
        fileNameFormat(time) {
            return `mavrik-meteor-error-${  time.getDate()  }-${  time.getMonth() + 1  }-${  time.getFullYear()  }  }.log`
        },
        format(time, level, message, data, userId) {
            data = JSON.parse(data)
            let logString = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] | "${message}" | User: ${  userId  }\r\n`
            if (data && Object.keys(data).length > 0) logString += `${JSON.stringify(data)}\r\n`
            return logString
        },
        path: logPath
    })).enable()

    export const ClientErrorLog = new Logger();
    (new LoggerFile(ClientErrorLog, {
        fileNameFormat(time) {
            return `mavrik-client-error-${  time.getDate()  }-${  time.getMonth() + 1  }-${  time.getFullYear()  }  }.log`
        },
        format(time, level, message, data, userId) {
            data = JSON.parse(data)
            let logString = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] | "${message}" | User: ${  userId  }\r\n`
            if (data && Object.keys(data).length > 0) logString += `${JSON.stringify(data)}\r\n`
            return logString
        },
        path: logPath
    })).enable()