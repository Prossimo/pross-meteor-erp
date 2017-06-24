import { HTTP } from 'meteor/http'
import config from '/imports/api/config/config'

const {
  slack: {
    apiRoot: SLACK_API_ROOT,
    botId: SLACK_BOT_ID,
    botToken: SLACK_BOT_TOKEN,
  }
} = config

const slackClient = {
  makeRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
    params: {
      token: SLACK_BOT_TOKEN,
      ...options,
    }
  }),
  rawRequest: ({ url }) => HTTP.get(url, {
    params: {
      token: SLACK_BOT_TOKEN,
    }
  })
}

const users = {
  list: () => slackClient.makeRequest('users.list'),
  admin: {
    invite: ({ email }) => slackClient.makeRequest('users.admin.invite', { email })
  }
}

const channels = {
  archive: ({ channel }) => slackClient.makeRequest('channels.archive', { channel }),
  create: ({ name }) => slackClient.makeRequest('channels.create', { name }),
  invite: ({ channel, user }) => slackClient.makeRequest('channels.invite', { channel, user }),
  inviteBot: ({ channel }) => slackClient.makeRequest('channels.invite', { channel, user: SLACK_BOT_ID }),
  list: () => slackClient.makeRequest('channels.list'),
}

const chat = {
  postMessage: ({ channel, text }) => slackClient.makeRequest('chat.postMessage', { channel, text }),
  postAttachments: ({ channel, attachments }) => slackClient.makeRequest('chat.postMessage', { channel, username: 'prossimobot', as_user: false, attachments }),
  postRawMessage: ({ channel, text, attachments, icon_url, as_user, username }) => slackClient.makeRequest('chat.postMessage', { channel, as_user, username, attachments, icon_url, text }),
}

const files = {
  sharedPublicURL: ({ file }) => slackClient.makeRequest('files.sharedPublicURL', { file }),
  get: ({ url }) => slackClient.rawRequest({ url }),
}

const attachments = {
  create: ({ pretext, title, text, color, title_link }) => JSON.stringify([{ pretext, title, text, color, title_link }]),
}

export {
  users,
  channels,
  chat,
  files,
  attachments,
}
