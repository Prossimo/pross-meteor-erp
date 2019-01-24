import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import {
  SalesRecords,
  Projects,
  Tasks,
  Settings,
  SlackUsers
} from "/imports/api/models";
import { slackClient } from "/imports/api/slack";
import isEmpty from "lodash/isEmpty";
import last from "lodash/last";
import difference from "lodash/difference";
import { users } from "/imports/api/slack/restful";

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
    },
    oldAssignees: {
      type: Array,
      optional: true
    },
    "oldAssignees.$": {
      type: String,
      optional: true
    },

    oldFollowers: {
      type: Array,
      optional: true
    },
    "oldFollowers.$": {
      type: String,
      optional: true
    }
  }).validator(),
  run({
    parentId,
    taskId,
    type,
    tabName,
    actorId,
    oldAssignees,
    oldFollowers
  }) {
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
    const _userRefer = user => {
      const list = users.list().data.members; //slack Workspace's members list

      Meteor.call("getSlackUsers");
      let userRefer = `<@${user.username}>`;

      if (user.slack && user.slack.id) {
        const userEmail = user.slack.profile.email;
        const currentSlackUser = list.find(l => l.profile.email == userEmail);
        if (currentSlackUser) {
          userRefer = `<@${currentSlackUser.id}>`;
        }
      }
      return userRefer;
    };

    if (parent) {
      const { slackChannel } = parent;
      const channel = slackChannel.id;
      if (channel) {
        const {
          name,
          description: text,
          status,
          comments,
          assignee,
          approver
        } = Tasks.findOne(taskId);
        const title_link = Meteor.absoluteUrl(`${parentType}/${parentId}`);
        const adminChanel = Settings.findOne({
          key: "SLACK_NOTIFICATION_CHANNEL"
        });
        const title = `${tabName}: ${name}`;

        switch (type) {
          case "ADD_COMMENT": {
            const comment = last(comments);
            const user = Meteor.users.findOne(comment.userId);
            let pretext = `A new comment from @${user.username} has been added`;
            if (
              user.slack &&
              user.slack.id &&
              slackUsers.members.find(({ id }) => id == user.slack.id)
            )
              pretext = `A new comment from <@${user.slack.id}> has been added`;
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text: comment.content,
              color: BLUE
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
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
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
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
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
          case "NEW_TASK": {
            //main variables
            const newAssignee = Meteor.users.findOne(assignee[0]); //returns string
            const followers = approver.map(item => Meteor.users.findOne(item));
            const actor = Meteor.users.findOne(actorId);

            let unassigned = "unassigned";
            let pretext = ""; //`New unassigned ${tabName} has been created`;
            let followersText = "";
            let assigneeText = "";
            let and = "";

            const actorRefer = _userRefer(actor);

            //Followers text part creation
            //========================================================

            if (!isEmpty(followers)) {
              //unassigned = "";

              const followersRefer = followers
                .map(item => _userRefer(item))
                .join();

              followersText = `${actorRefer} has added ${followersRefer} as follower`;
              and = "and";
            }

            //Assignee text part creation
            //=========================================================

            if (newAssignee) {
              unassigned = "";

              const assigneeRefer = _userRefer(newAssignee);

              assigneeText = `has been assigned to ${assigneeRefer} by ${actorRefer} in ${status} board of <${title_link}|${
                parent.name
              }>`;
            }

            //Full pretext creation
            //========================================================
            if (unassigned) {
              pretext = `New ${unassigned} ${tabName} has been created by ${actorRefer} in ${status} board of <${title_link}|${
                parent.name
              }> ${and} ${followersText}`;
            } else {
              pretext = `New ${tabName} ${assigneeText} ${and} ${followersText} `;
            }
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }
          //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
          case "ASSIGN_TASK": {
            //main variables
            const newAddedAssignees = difference(assignee, oldAssignees);
            const newAddedFollowers = difference(approver, oldFollowers);

            const actor = Meteor.users.findOne(actorId);

            let isAssigned = false;
            let pretext = "";
            let followersText = "";
            let assigneeText = "";
            let and = "";

            const actorRefer = _userRefer(actor);

            //Assignee text part creation
            //=========================================================
            if (!isEmpty(newAddedAssignees)) {
              isAssigned = true;
              const newAssignee = Meteor.users.findOne(newAddedAssignees[0]);
              const assigneeRefer = _userRefer(newAssignee); //returns a string

              assigneeText = `has been assigned to ${assigneeRefer} by ${actorRefer}`;
            } else {
            }

            //Followers text part creation
            //========================================================

            if (!isEmpty(newAddedFollowers)) {
              const newFollowers = newAddedFollowers.map(item =>
                Meteor.users.findOne(item)
              );
              const followersRefer = newFollowers
                .map(item => _userRefer(item))
                .join(); //returns a string of joined array'd elements

              followersText = `${actorRefer} has added ${followersRefer} as follower`;
              and = "and";
            }

            //Full pretext creation
            //========================================================

            if (isAssigned) {
              pretext = `${article} ${tabName} ${assigneeText} in ${status} board of <${title_link}|${
                parent.name
              }>  ${and} ${followersText} `;
            } else {
              pretext = `${article} ${tabName} has been updated in ${status} board of <${title_link}|${
                parent.name
              }> ${and} ${followersText} `;
            }

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

          //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
          case "UPDATE_TASK": {
            //main variables
            const actor = Meteor.users.findOne(actorId);
            const actorRefer = _userRefer(actor);

            const attachments = slackClient.attachments.create({
              pretext: `${article} ${tabName} have been updated  by ${actorRefer} in ${status} board of <${title_link}|${
                parent.name
              }>`,
              title,
              text,
              color: ORANGE,
              title_link
            });
            slackClient.chat.postAttachments({ channel, attachments });
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
              slackClient.chat.postAttachments({
                channel: adminChanel.value,
                attachments
              });
            }
            break;
          }

          //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
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
            if (adminChanel && adminChanel.value && isEmpty(assignee)) {
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
