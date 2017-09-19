import {Meteor} from 'meteor/meteor'
import Events from './events'

Meteor.publish('events.byProject', (projectId) => {
    check(projectId, String)

    return Events.find({projectId})
})