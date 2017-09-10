import slackify from 'slackify-html'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import request from 'request'
import slackClient from '../restful'
import {slack} from '/imports/api/config'
import {Threads, SalesRecords, SlackMails, Conversations} from '/imports/api/models'
import {ServerSideQuotedHTMLTransformer as QuotedHTMLTransformer} from '/imports/utils/quoted-html-transformer'
import config from '/imports/api/config'

const SLACK_MESSAGE_MAX_SIZE = 4000

Meteor.methods({
    sendMailToSlack(message, {files, mentions}={}) {
        check(message, Object)
        check(files, Match.Maybe(Array))
        check(mentions, Match.Maybe(Array))

        const thread = Threads.findOne({id: message.thread_id})
        let target, conversation
        if (thread && thread.conversationId) {
            conversation = Conversations.findOne({_id: thread.conversationId})
            target = conversation.parent()
        }

        let threadable = false
        let slackChannelId = target ? target.slackChanel : null

        if (!slackChannelId) {
            const channelsListRes = slackClient.channels.list()
            if (channelsListRes.statusCode != 200 || !channelsListRes.data.ok || !channelsListRes.data.channels) throw new Meteor.Error('Could not get slack channel')

            const channels = channelsListRes.data.channels
            const inboxChannel = _.findWhere(channels, {name: 'inbox'})
            if (!inboxChannel) {
                const channelsCreateRes = slackClient.channels.create({name: 'inbox', validate: true})
                if (channelsCreateRes.statusCode != 200 || !channelsCreateRes.data.ok) throw new Meteor.Error('Could not create inbox slack channel')
                slackChannelId = channelsCreateRes.data.channel.id
            } else {
                slackChannelId = inboxChannel.id
            }
            threadable = true
        }

        if (!slackChannelId) throw new Meteor.Error('Could not find slack channel for inbox')

        let thread_ts = null
        const slackMail = SlackMails.findOne({thread_id: message.thread_id})
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
        const slackText = `${mentions&&mentions.length ? `${mentions.map(m => `<@${m.id}|${m.name}>`).join(', ')}. `:''}An email was sent from ${message.from[0].email} to ${to.join(', ')}`

        console.log(`=========> Sending mail(${message.id}) to slack`)
        let mailtext = message.body.replace('\"', '"')//.replace('\n','')
        mailtext = QuotedHTMLTransformer.removeQuotedHTML(mailtext, {
            keepIfWholeBodyIsQuote: true,
            includeInline: true,
            includeSignature: true,
        })
        console.log(mailtext)

        console.log('============')
        mailtext = slackify(mailtext)

        const mailtextBuf = new Buffer(mailtext, 'utf-8')
        if(mailtextBuf.length >= SLACK_MESSAGE_MAX_SIZE) {
            mailtext = mailtextBuf.slice(0, SLACK_MESSAGE_MAX_SIZE).toString()
        }
        console.log(mailtext)
        console.log('==========> End')

        if (target && conversation) {
            mailtext += `\n\n<${Meteor.absoluteUrl(`${target.type}/${target._id}`)}|Go to ${target.type} ${target.name}/${conversation.name}>`
        }

        mailtext += `\n\n<${Meteor.absoluteUrl(`emailview/${message.id}`)}|See full email>`
        const params = {
            username: slack.botName,
            attachments: [
                {
                    fallback: message.snippet,
                    color: '#36a64f',
                    title: message.subject,
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
        if (threadable && thread_ts) params.thread_ts = thread_ts

        Meteor.call('sendBotMessage', slackChannelId, slackText, params, message.thread_id)

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
