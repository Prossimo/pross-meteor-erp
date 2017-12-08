import {Meteor} from 'meteor/meteor'
import SlackMessages from './slackMessages'
import SalesRecords from '../salesRecords/salesRecords'
import Projects from '../projects/projects'


Meteor.publish('slackmessages.bySalesRecord', (salesRecordId) => {
    check(salesRecordId, String)

    const salesRecord = SalesRecords.findOne(salesRecordId)
    if (salesRecord.slackChannel) {
        return SlackMessages.find({channel: salesRecord.slackChannel.id}, {sort: { createdAt: -1 }})
    } else {
        return []
    }
})

Meteor.publish('slackmessages.byProject', (projectId) => {
    check(projectId, String)

    const project = Projects.findOne(projectId)
    if (project.slackChannel) {
        return SlackMessages.find({channel: project.slackChannel.id}, {sort: { createdAt: -1 }})
    } else {
        return []
    }
})