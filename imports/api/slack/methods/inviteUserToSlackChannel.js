import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    inviteUserToSlackChannel({id, isPrivate, user}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))
        check(user, String)

        const inviteUser = isPrivate ? slackClient.groups.invite : slackClient.channels.invite

        console.log('========> inviteUserToSlackChannel', {id, isPrivate, user})
        const res = inviteUser({
            channel: id,
            user
        })

        console.log(res.data)
        return res
    }
})
