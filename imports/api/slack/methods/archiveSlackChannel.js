import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    archiveSlackChannel({id, isPrivate}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))

        if(isPrivate) {
            return slackClient.groups.archive({ channel: id })
        } else {
            return slackClient.channels.archive({ channel: id })
        }
    }
})
