import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import {slack} from '/imports/api/config'
import {SalesRecords} from '/imports/api/models'


Meteor.methods({
    sendDealStatusChangeToSlack({salesRecordId, statusName, oldValue, newValue}) {
        check(salesRecordId, String)
        check(statusName, String)
        check(oldValue, Match.Maybe(String))
        check(newValue, Match.Maybe(String))

        const user = Meteor.user()
        if(!user) throw new Meteor.Error('[sendDealStatusChangeToSlack]: Invalid user')

        const salesRecord = SalesRecords.findOne(salesRecordId)

        if(!salesRecordId) throw new Meteor.Error(`[sendDealStatusChangeToSlack]: Could not find deal with _id:${salesRecordId}`)

        const slackChannelId = salesRecord.slackChanel
        if (!slackChannelId) throw new Meteor.Error(`[sendDealStatusChangeToSlack]: Could not find slackChannel on deal:${salesRecordId}`)

        const slackUser = user.slack

        const pretext = `${slackUser ? `<@${slackUser.id}|${slackUser.name}>` : `@${user.username}`} changed ${statusName} from [${oldValue}] to [${newValue}] in [${salesRecord.name}]`
        const text = `<${Meteor.absoluteUrl(`deal/${salesRecordId}`)}|Go to Deal: ${salesRecord.name}>`

        console.log(`[sendDealStatusChangeToSlack]: sending message ----- ${pretext} \r\n ${text}`)

        const params = {
            username: slack.botName,
            attachments: [
                {
                    color: '#7CD197',
                    pretext,
                    text,
                    image_url: 'http://my-website.com/path/to/image.jpg',
                    thumb_url: 'http://example.com/path/to/thumb.png',
                    footer: 'Mavrik CRM',
                    footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                    mrkdwn_in: ['text']
                }
            ],
            as_user: false
        }

        Meteor.call('sendBotMessage', slackChannelId, pretext, params)
    },
})
