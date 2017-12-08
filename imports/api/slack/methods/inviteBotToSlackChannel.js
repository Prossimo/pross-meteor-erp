import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    inviteBotToSlackChannel({id, isPrivate}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))

        const inviteBot = isPrivate ? slackClient.groups.inviteBot : slackClient.channels.inviteBot

        return inviteBot({
            channel: id
        })
    }
})
