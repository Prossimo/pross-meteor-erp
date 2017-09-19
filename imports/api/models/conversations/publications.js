import {Meteor} from 'meteor/meteor'
import Conversations from './conversations'

Meteor.publish('conversations.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Conversations.find({})
})

