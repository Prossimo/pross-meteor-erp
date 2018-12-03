import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { SalesRecords, Projects, Tasks, Settings } from "/imports/api/models";
import { slackClient } from "/imports/api/slack";

const RED = "#FF4C4C";
const ORANGE = "#FFA64C";
const BLUE = "#7CD197";

export default new ValidatedMethod({
  name: "task.sendSlackMessage",
  validate: new SimpleSchema({
    parentId: String,
    taskId: String,
    type: String,
    tabName: String,
    actorId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ parentId, taskId, type, tabName, actorId }) {
    let parent = null;
    let parentType = null;
    tabName = tabName.slice(0, -1).toLowerCase();
    const check = ["a", "e", "i", "o", "u"];
    let article = check.includes(tabName.charAt(0)) ? "An" : "A";
    if ((parent = SalesRecords.findOne(parentId))) {
      parentType = "deal";
    } else if ((parent = Projects.findOne(parentId))) {
      parentType = "project";
    }

    if (parent) {
      const { slackChannel } = parent;
      const channel = slackChannel.id;
      if (channel) {
        const {
          name,
          description: text,
          status,
          comments,
          assignee
        } = Tasks.findOne(taskId);
        const title_link = Meteor.absoluteUrl(`${parentType}/${parentId}`);
        const adminChanel = Settings.findOne({
          key: "SLACK_NOTIFICATION_CHANNEL"
        });
        const title = `${tabName}: ${name}`;
        switch (type) {
          case "ADD_COMMENT": {
            const comment = _.last(comments);
            const user = Meteor.users.findOne(comment.userId);
            let pretext = `A new comment from @${user.username} has been added`;
            if (user.slack && user.slack.id)
              pretext = `A new comment from <@${user.slack.id}> has been added`;
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text: comment.content,
              color: BLUE
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "REMOVE_FILE": {
            const attachments = slackClient.attachments.create({
              pretext: "A attachment file has been removed",
              title,
              text,
              color: RED,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "ATTACH_FILE": {
            const attachments = slackClient.attachments.create({
              pretext: "A file have been attached",
              title,
              text,
              color: BLUE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "ASSIGN_TASK": {
            const user = Meteor.users.findOne(assignee);
            const actor = Meteor.users.findOne(actorId);
            const userRefer =
              user.slack && user.slack.id
                ? `<@${user.slack.id}>`
                : user.username;
            const actorRefer =
              actor.slack && actor.slack.id
                ? `<@${actor.slack.id}>`
                : actor.username;
            const pretext = `New ${tabName} has been assigned to ${userRefer} by ${actorRefer} in ${status} board of <${title_link}|${
              parent.name
            }>`;

            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "UPDATE_TASK": {
            const actor = Meteor.users.findOne(actorId);
            const actorRefer =
              actor.slack && actor.slack.id
                ? `<@${actor.slack.id}>`
                : actor.username;
            const attachments = slackClient.attachments.create({
              pretext: `${article} ${tabName} have been updated by ${actorRefer} in ${status} board of <${title_link}|${
                parent.name
              }>`,
              title,
              text,
              color: ORANGE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "REMOVE_TASK": {
            const attachments = slackClient.attachments.create({
              pretext: `${article} ${tabName} have been removed from ${status} board of <${title_link}|${
                parent.name
              }>`,
              title,
              text,
              color: RED,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          case "NEW_TASK": {
            let pretext = null;
            const user = Meteor.users.findOne(assignee);
            const actor = Meteor.users.findOne(actorId);
            if (user) {
              const userRefer =
                user.slack && user.slack.id
                  ? `<@${user.slack.id}>`
                  : user.username;
              const actorRefer =
                actor.slack && actor.slack.id
                  ? `<@${actor.slack.id}>`
                  : actor.username;
              pretext = `New ${tabName} has been assigned to ${userRefer} by ${actorRefer} in ${status} board of <${title_link}|${
                parent.name
              }>`;
            } else {
              pretext = `New unassigned ${tabName} has been created`;
            }
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && !assignee) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }
        }
      }
    }
  }
});
