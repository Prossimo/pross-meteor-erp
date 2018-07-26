import slackify from 'slackify-html'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import slackClient from '../restful'
import {slack} from '/imports/api/config'
import {Threads, SlackMails, Conversations, NylasAccounts, Projects} from '/imports/api/models'
import {ServerSideQuotedHTMLTransformer as QuotedHTMLTransformer} from '/imports/utils/quoted-html-transformer'

const SLACK_MESSAGE_MAX_SIZE = 4000

Meteor.methods({
    sendMailToSlack(message, {files, mentions} = {}) {
        console.log('>>>>>>>>>>-> sendMailToSlack', message.id)
        check(message, Object)
        check(files, Match.Maybe(Array))
        check(mentions, Match.Maybe(Array))

        const thread = Threads.findOne({id: message.thread_id})
        let target, conversation
        if (thread && thread.conversationId) {
            conversation = Conversations.findOne({_id: thread.conversationId})
            target = conversation ? conversation.parent() : null
        } else {
            const nylasAccount = NylasAccounts.findOne({accountId: message.account_id})
            target = Projects.findOne({nylasAccountId: nylasAccount._id})
        }

        let slackChannelId = target ? target.slackChannel.id : null

        if (!slackChannelId) {
            slackChannelId = Meteor.call('getInboxSlackChannelId')
        }

        if (!slackChannelId) throw new Meteor.Error('Could not find slack channel for inbox')

        let thread_ts = null
        const slackMail = SlackMails.findOne({thread_id: message.thread_id})
        // console.log('=====> slackmails', slackMail._id)
        if (slackMail) thread_ts = slackMail.thread_ts

        const to = []
        message.to.forEach((c) => {
            to.push(c.email)
        })
        message.cc.forEach((c) => {
            to.push(c.email)
        })
        message.bcc.forEach((c) => {
            to.push(c.email)
        })
        const slackText = `${mentions && mentions.length ? `${mentions.map(m => `<@${m.id}|${m.name}>`).join(', ')}. ` : ''}An email was sent from ${message.from[0].email} to ${to.join(', ')}`

        console.log(`=========> Sending mail(${message.id}) to slack`)
        let mailtext = message.body.replace('\"', '"')//.replace('\n','')
        mailtext = QuotedHTMLTransformer.removeQuotedHTML(mailtext, {
            keepIfWholeBodyIsQuote: true,
            includeInline: true,
            includeSignature: true,
        })
        // console.log(mailtext)

        // console.log('============')
        mailtext = slackify(mailtext)

        const mailtextBuf = new Buffer(mailtext, 'utf-8')
        if (mailtextBuf.length >= SLACK_MESSAGE_MAX_SIZE) {
            mailtext = mailtextBuf.slice(0, SLACK_MESSAGE_MAX_SIZE).toString()
        }
        // console.log(mailtext)
        // console.log('==========> End')

        if (target && conversation) {
            mailtext += `\n\n<${Meteor.absoluteUrl(`${target.type}/${target._id}`)}|Go to ${target.type} ${target.name}/${conversation.name}>`
        }

        const params = {
            username: slack.botName,
            attachments: [
                {
                    fallback: message.snippet,
                    color: '#36a64f',
                    title: message.subject,
                    title_link: Meteor.absoluteUrl(`emailview?message_id=${message.id}`),
                    text: mailtext,
                    image_url: 'http://my-website.com/path/to/image.jpg',
                    thumb_url: 'http://example.com/path/to/thumb.png',
                    footer: 'Mavrik CRM',
                    footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                    ts: new Date().getTime() / 1000,
                    mrkdwn_in: ['text']
                }
            ],
            as_user: false
        }
        if (thread_ts) {
            params.thread_ts = thread_ts
            params.reply_broadcast = true
        }

        console.log('===> sendBotMessage', params)
        const ts = Meteor.call('sendBotMessage', slackChannelId, slackText, params)

        if (!slackMail) SlackMails.insert({thread_id: message.thread_id, thread_ts: ts})

        /*if(files && files.length) {
            files.forEach(file => {console.log(file)
                request.post({url:`${config.slack.apiRoot}/files.upload`, formData:{
                    token: config.slack.botToken,
                    file,
                    channels: slackChannelId
                }}, (err, response, body) => {
                    if(err) console.error(err)
                })
            })

        }*/
    },

})