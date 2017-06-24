import config from '/imports/api/config/config'
import SlackBot from 'slackbots'

const {
  slack: {
    botToken: SLACK_BOT_TOKEN,
  }
} = config

export default new SlackBot({
  token: SLACK_BOT_TOKEN,
  name: 'prossimobot'
})
