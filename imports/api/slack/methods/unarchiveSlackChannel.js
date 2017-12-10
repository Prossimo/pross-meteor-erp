import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    unarchiveSlackChannel({id, isPrivate}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))

        if(isPrivate) {
            return slackClient.groups.unarchive({ channel: id })
        } else {
            return slackClient.channels.unarchive({ channel: id })
        }
    }
})
