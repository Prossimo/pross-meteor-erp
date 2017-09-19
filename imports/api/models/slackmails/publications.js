import {Meteor} from 'meteor/meteor'
import SlackMails from './slackmails'

Meteor.publish('slackmails.all', function () {
    if(!this.userId) {
        this.ready()
        return
    }
    return SlackMails.find({})
})