import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'
import {slack} from '/imports/api/config'

Meteor.methods({
    sendBotMessage(channel, text, {username = slack.botName, icon_url, attachments, thread_ts, as_user = false, reply_broadcast=false}) {
        check(channel, String)
        check(text, String)
        check(username, String)
        check(icon_url, Match.Optional(String))
        check(attachments, Match.Optional(Array))
        check(as_user, Boolean)
        check(thread_ts, Match.Optional(String))

        const {data: {ts}} = slackClient.chat.postRawMessage({
            channel,
            text,
            username,
            icon_url,
            as_user,
            attachments: JSON.stringify(attachments),
            thread_ts,
            reply_broadcast
        })

        return ts
    }
})
