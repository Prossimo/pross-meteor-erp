import {Meteor} from 'meteor/meteor'
import SlackUsers from './slackUsers'

Meteor.publish('slackusers.all',function() {
    if(!this.userId) return this.ready()

    return SlackUsers.find()
})