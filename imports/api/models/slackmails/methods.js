/* global ServerLog */
import {slack} from '/imports/api/config'
import slackClient from  '/imports/api/slack/restful'
import {SlackMails, Threads, Projects, NylasAccounts} from '/imports/api/models'


Meteor.methods({
    insertSlackMail(data)
    {
        check(data, {
            thread_id: String,
            thread_ts: String
        })

        return SlackMails.insert(data)
    },
    moveSlackMails({thread_id, channel}) {
        const slackmail = SlackMails.findOne({thread_id})
        ServerLog.info('========> SlackMails', slackmail)
        if(!slackmail) return

        const thread = Threads.findOne({id:slackmail.thread_id})
        ServerLog.info('========> Thread', thread)
        if(!thread) return

        const nylasAccount = NylasAccounts.findOne({accountId:thread.account_id})
        ServerLog.info('=========> NylasAccount', nylasAccount)
        if(!nylasAccount) return

        const project = Projects.findOne({nylasAccountId:nylasAccount._id})
        ServerLog.info('========> Project', project)
        if(!project) return

        const replies = slackClient.channels.replies({channel: project.slackChanel, thread_ts:slackmail.thread_ts})
        ServerLog.info('========> SlackReplies', replies.data)
        if(!replies.data.ok) return
        const msgs = replies.data.messages

        // Delete messages from general inbox channel
        msgs.forEach((msg) => {
            console.log({channel:project.slackChanel, ts:msg.ts})
            console.log(slackClient.chat.deleteMessage({channel:project.slackChanel, ts:msg.ts}))
        })
        // Delete slackmails from database
        SlackMails.remove({thread_id})

        // Insert messages to new channel
        const sendToNewChannel = ({text, attachments, thread_ts}) => {
            const params = {
                username: slack.botName,
                attachments,
                as_user: false
            }
            if (thread_ts) {
                params.thread_ts = thread_ts
                params.reply_broadcast = true
            }

            return Meteor.call('sendBotMessage', channel, text, params)
        }

        let thread_ts
        msgs.forEach((msg) => {

            if(msg.ts === msg.thread_ts) {
                thread_ts = sendToNewChannel(msg)
            } else {
                sendToNewChannel(Object.assign(msg, {thread_ts}))
            }
        })
    }
})