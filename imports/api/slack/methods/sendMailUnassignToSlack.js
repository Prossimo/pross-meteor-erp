import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import slackClient from '../restful'
import {slack} from '/imports/api/config'

Meteor.methods({
    sendMailUnassignToSlack(thread, {unassignee, assigner}={}) {
        check(thread, Object)
        check(unassignee, Object)
        check(assigner, Match.Maybe(Object))

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

        if (!slackChannelId) throw new Meteor.Error('Could not find slack channel for inbox')

        let slackText = `An email was unassigned from <@${unassignee.id}|${unassignee.name}>`
        if(assigner) slackText += ` by <@${assigner.id}|${assigner.name}>`

        console.log(`=========> Sending mail thread(${thread.id}) to slack`)
        const params = {
            username: slack.botName,
            attachments: [
                {
                    fallback: thread.snippet,
                    color: '#f60000',
                    pretext: `${_.pluck(thread.participants, 'email').join(', ')}`,
                    title: thread.subject,
                    title_link: Meteor.absoluteUrl(`emailview?thread_id=${thread.id}`),
                    text: thread.snippet,
                    image_url: 'http://my-website.com/path/to/image.jpg',
                    thumb_url: 'http://example.com/path/to/thumb.png',
                    footer: 'Mavrik CRM',
                    footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                    mrkdwn_in: ['text']
                }
            ],
            as_user: false
        }

        Meteor.call('sendBotMessage', slackChannelId, slackText, params)
    },
})
