import slackify from 'slackify-html'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import slackClient from '../restful'
import {slack} from '/imports/api/config'
import {SlackMails} from '/imports/api/models'
import {ServerSideQuotedHTMLTransformer as QuotedHTMLTransformer} from '/imports/utils/quoted-html-transformer'

const SLACK_MESSAGE_MAX_SIZE = 4000

Meteor.methods({
    sendMailAssignToSlack(message, {assignee, assigner}={}) {
        check(message, Object)
        check(assignee, Object)
        check(assigner, Object)

        let threadable = false
        let slackChannelId

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
        const slackText = `An email was assigned to <@${assignee.id}|${assignee.name}> by <@${assigner.id}|${assigner.name}>`

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

        const params = {
            username: slack.botName,
            attachments: [
                {
                    fallback: message.snippet,
                    color: '#f6a64f',
                    pretext: `${message.from[0].email} >>> ${to.join(', ')}`,
                    title: message.subject,
                    title_link: Meteor.absoluteUrl(`emailview/${message.id}`),
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
    },
})
