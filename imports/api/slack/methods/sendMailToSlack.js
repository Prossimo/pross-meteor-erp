import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import cheerio from 'cheerio'
import toMarkdown from 'to-markdown'
import slackClient from '../restful'
import { Threads, SalesRecords, SlackMails } from '/imports/api/models'

Meteor.methods({
  sendMailToSlack(message) {
    check(message, Object)

    const thread = Threads.findOne({ id: message.thread_id })
    let salesRecord
    if (thread) {
      salesRecord = SalesRecords.findOne({_id: thread.salesRecordId})
    }

    let threadable = false
    let slackChannelId = salesRecord ? salesRecord.slackChanel : null

    if (!slackChannelId) {
      const channelsListRes = slackClient.channels.list()
      if (channelsListRes.statusCode != 200 || !channelsListRes.data.ok || !channelsListRes.data.channels) throw new Meteor.Error('Could not get slack channel')

      const channels = channelsListRes.data.channels
      const inboxChannel = _.find(channels, {name: 'inbox'})
      if (!inboxChannel) {
        const channelsCreateRes = slackClient.channels.create({ name: 'inbox', validate: true })
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
    const slackText = `An email was sent from ${message.from[0].email} to ${to.join(', ')}`

    const $ = cheerio.load(message.body)
    $('blockquote').remove()
    const p = $('p')
    for( let i = 0; i < p.length; i++ ) {
      if(/wrote:/.test(p.eq(i).text())) p.eq(i).remove()
    }
    const params = {
      username: 'prossimobot',//getSlackUsername(Meteor.user()),
      //icon_url: getAvatarUrl(Meteor.user()),
      attachments: [
        {
          'fallback': message.snippet,
          'color': '#36a64f',
          //"pretext": "Optional text that appears above the attachment block",
          //"author_name": "Bobby Tables",
          //"author_link": "http://flickr.com/bobby/",
          //"author_icon": "http://flickr.com/icons/bobby.jpg",
          'title': message.subject,
          //"title_link": "https://api.slack.com/",
          text: toMarkdown($.html()),
          // "fields": [
          //     {
          //         "title": "Priority",
          //         "value": "High",
          //         "short": false
          //     }
          // ],
          'image_url': 'http://my-website.com/path/to/image.jpg',
          'thumb_url': 'http://example.com/path/to/thumb.png',
          'footer': 'Prossimo CRM',
          'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
          'ts': new Date().getTime() / 1000
        }
      ],
      as_user: false
    }
    if (threadable && thread_ts) params.thread_ts = thread_ts

    Meteor.call('sendBotMessage', slackChannelId, slackText, params, message.thread_id)
  },
})
