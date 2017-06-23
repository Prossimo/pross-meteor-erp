import { HTTP } from 'meteor/http'
import config from '/imports/api/config/config'

const {
  slack: {
    apiRoot: SLACK_API_ROOT,
    apiKey: SLACK_API_KEY,
    botId: SLACK_BOT_ID,
    botToken: SLACK_BOT_TOKEN,
  }
} = config

const slackClient = {
  makeRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
    params: {
      token: SLACK_API_KEY,
      ...options,
    }
  })
}

const users = {
  list: () => slackClient.makeRequest('users.list')
}

const channels = {
  archive: ({ channel }) => slackClient.makeRequest('channels.archive', { channel }),
  create: ({ name }) => slackClient.makeRequest('channels.create', { name }),
  invite: ({ channel, user }) => slackClient.makeRequest('channels.invite', { channel, user }),
  inviteBot: ({ channel }) => slackClient.makeRequest('channels.invite', { channel, user: SLACK_BOT_ID }),
}

export {
  users,
  channels,
}
