import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    inviteUserToSlackChannel({id, isPrivate, user}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))
        check(user, String)

        const inviteUser = isPrivate ? slackClient.groups.invite : slackClient.channels.invite

        return inviteUser({
            channel: id,
            user
        })
    }
})
