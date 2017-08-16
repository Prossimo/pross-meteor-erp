import slackBot from './slackBot'

slackBot.on('message', Meteor.bindEnvironment(data => {
  console.log('=======> slack onMessage response',data)
  data.type === 'message' && Meteor.call('parseSlackMessage', data)
}))
