import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { SalesRecords, Projects, Tasks, Settings } from '/imports/api/models'
import { slackClient } from '/imports/api/slack'

const RED = '#FF4C4C'
const ORANGE = '#FFA64C'
const BLUE = '#7CD197'

export default new ValidatedMethod({
  name: 'task.sendSlackMessage',
  validate: new SimpleSchema({
    parentId: String,
    taskId: String,
    type: String,
    actorId: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ parentId, type, taskId, actorId }) {
    let parent = null
    let parentType = null

    if (parent = SalesRecords.findOne(parentId)) {
      parentType = 'salesrecord'
    } else {
      if (parent = Projects.findOne(parentId)) {
        parentType = 'project'
      }
    };

    if (parent) {
      const { slackChanel: channel } = parent
      const { name, description: text, status, comments, assignee } = Tasks.findOne(taskId)
      const title_link = Meteor.absoluteUrl(`${parentType}/${parentId}`)
      const adminChanel = Settings.findOne({key: 'SLACK_NOTIFICATION_CHANNEL'})
      const title = `Task: ${name}`
      if (channel) {
        switch (type) {
          case 'ADD_COMMENT': {
            const comment = _.last(comments)
            const user = Meteor.users.findOne(comment.userId)
            let pretext = `A new comment from @${user.username} has been added`
            if (user.slack && user.slack.id)
              pretext = `A new comment from <@${user.slack.id}> has been added`
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text: comment.content,
              color: BLUE,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'REMOVE_FILE': {
            const attachments = slackClient.attachments.create({
              pretext: 'A attachment file has been removed',
              title,
              text,
              color: RED,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'ATTACH_FILE': {
            const attachments = slackClient.attachments.create({
              pretext: 'A file have been attached',
              title,
              text,
              color: BLUE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'ASSIGN_TASK': {
            const user = Meteor.users.findOne(assignee)
            const actor = Meteor.users.findOne(actorId)
            const userRefer = (user.slack && user.slack.id) ? `<@${user.slack.id}>` : user.username
            const actorRefer = (actor.slack && actor.slack.id) ? `<@${actor.slack.id}>` : actor.username
            const pretext = `New task has been assigned to ${userRefer} by ${actorRefer} in ${status} board`

            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'UPDATE_TASK': {
            const actor = Meteor.users.findOne(actorId)
            const actorRefer = (actor.slack && actor.slack.id) ? `<@${actor.slack.id}>` : actor.username
            const attachments = slackClient.attachments.create({
              pretext: `A task have been updated by ${actorRefer} in ${status} board`,
              title,
              text,
              color: ORANGE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'REMOVE_TASK': {
            const attachments = slackClient.attachments.create({
              pretext: `A task have been removed from ${status} board`,
              title,
              text,
              color: RED,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }

          case 'NEW_TASK': {
            let pretext = null
            const user = Meteor.users.findOne(assignee)
            const actor = Meteor.users.findOne(actorId)
            if (user) {
              const userRefer = (user.slack && user.slack.id) ? `<@${user.slack.id}>` : user.username
              const actorRefer = (actor.slack && actor.slack.id) ? `<@${actor.slack.id}>` : actor.username
              pretext = `New task has been assigned to ${userRefer} by ${actorRefer} in ${status} board`
            } else {
              pretext = 'New unassigned task has been created'
            }
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({ channel: adminChanel.value, attachments })
            }
            break
          }
        }
      }
    }
  },
})
