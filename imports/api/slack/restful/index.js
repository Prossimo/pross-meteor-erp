import {HTTP} from 'meteor/http'
import config from '/imports/api/config'

export const ERROR = {
    AlreadyInTeam: 'already_in_team',
    AlreadyInvited: 'already_invited'
}
const {
    slack: {
        apiRoot: SLACK_API_ROOT,
        apiKey: SLACK_API_TOKEN,
        inviteKey: SLACK_INVITE_KEY,
        botId: SLACK_BOT_ID,
        botToken: SLACK_BOT_TOKEN,
        botName: SLACK_BOT_NAME
    }
} = config

const slackClient = {
    makeRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
        params: {
            token: options.token ? options.token : SLACK_API_TOKEN,
            ...options,
        }
    }),
    makeRawRequest: ({url}) => HTTP.get(url, {
        params: {
            token: SLACK_API_TOKEN,
        }
    }),
    makeBotRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
        params: {
            token: SLACK_BOT_TOKEN,
            ...options,
        }
    }),
}

const users = {
    list: (cursor) => slackClient.makeRequest('users.list',cursor?{cursor}:{}),
    admin: {
        invite: ({email}) => slackClient.makeRequest('users.admin.invite', {email, token:SLACK_INVITE_KEY})
    }
}

const channels = {
  archive: ({ channel }) => slackClient.makeRequest('channels.archive', { channel }),
  create: ({ name }) => slackClient.makeRequest('channels.create', { name }),
  invite: ({ channel, user }) => slackClient.makeRequest('channels.invite', { channel, user }),
  inviteBot: ({ channel }) => slackClient.makeRequest('channels.invite', { channel, user: SLACK_BOT_ID }),
  info: ({ channel }) => slackClient.makeRequest('channels.info', { channel }),
  list: () => slackClient.makeRequest('channels.list'),
  rename: ({ channel, name }) => slackClient.makeRequest('channels.rename', { channel, name }),
  setPurpose: ({ channel, purpose }) => slackClient.makeRequest('channels.setPurpose', { channel, purpose }),
  setTopic: ({ channel, topic }) => slackClient.makeRequest('channels.setTopic', { channel, topic }),
  history: ({ channel, count, inclusive, latest }) => slackClient.makeRequest('channels.history', { channel, count, inclusive, latest }),
  replies: ({ channel, thread_ts }) => slackClient.makeRequest('channels.replies', { channel, thread_ts }),
}

const groups = {
  archive: ({ channel }) => slackClient.makeRequest('groups.archive', { channel }),
  create: ({ name }) => slackClient.makeRequest('groups.create', { name }),
  invite: ({ channel, user }) => slackClient.makeRequest('groups.invite', { channel, user }),
  inviteBot: ({ channel }) => slackClient.makeRequest('groups.invite', { channel, user: SLACK_BOT_ID }),
  info: ({ channel }) => slackClient.makeRequest('groups.info', { channel }),
  list: () => slackClient.makeRequest('groups.list'),
  rename: ({ channel, name }) => slackClient.makeRequest('groups.rename', { channel, name }),
  setPurpose: ({ channel, purpose }) => slackClient.makeRequest('groups.setPurpose', { channel, purpose }),
  setTopic: ({ channel, topic }) => slackClient.makeRequest('groups.setTopic', { channel, topic }),
  history: ({ channel, count, inclusive, latest }) => slackClient.makeRequest('groups.history', { channel, count, inclusive, latest }),
  replies: ({ channel, thread_ts }) => slackClient.makeRequest('groups.replies', { channel, thread_ts }),
}

const chat = {
    postMessage: ({channel, text}) => slackClient.makeBotRequest('chat.postMessage', {channel, text}),
    postAttachments: ({channel, attachments}) => slackClient.makeBotRequest('chat.postMessage', {
        channel,
        username: SLACK_BOT_NAME,
        as_user: false,
        attachments
    }),
    postRawMessage: ({channel, text, attachments, icon_url, as_user, username, thread_ts, reply_broadcast}) => {
        const params = {
            channel,
            as_user,
            username,
            attachments,
            icon_url,
            text,
            reply_broadcast
        }
        if(thread_ts) params.thread_ts = thread_ts
        return slackClient.makeBotRequest('chat.postMessage', params)
    },
    deleteMessage: ({channel, ts}) => slackClient.makeBotRequest('chat.delete', {channel, ts}),

}

const files = {
    sharedPublicURL: ({file}) => slackClient.makeRequest('files.sharedPublicURL', {file}),
    get: ({url}) => slackClient.makeRawRequest({url})
}

const attachments = {
    create: ({pretext, title, text, color, title_link}) => JSON.stringify([{pretext, title, text, color, title_link}]),
}

export {
    users,
    channels,
    groups,
    chat,
    files,
    attachments,
}
