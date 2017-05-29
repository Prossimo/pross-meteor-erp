import SimpleSchema from 'simpl-schema';
import { HTTP } from 'meteor/http';
import { SalesRecords, Projects, Tasks } from '/imports/api/models';
import { slack } from '/imports/api/config/config';

const { apiRoot, apiKey, botId, botToken } = slack;

// SEND SLACK MESSAGE
const sendMessage = ({ channel, text, attachments })=> {
  const params = { token: botToken, channel };
  text && (params.text = text);
  attachments && (params.attachments = attachments);
  HTTP.post(`${apiRoot}/chat.postMessage`, {
    params,
  });
};

// SEND SLACK ATTACHMENTS
const sendAttachment = ({ pretext, title, text, color, title_link, channel })=> {
  const attachment = {
    pretext,
    title,
    text,
    color,
    title_link,
  };
  sendMessage({
    channel,
    attachments: JSON.stringify([attachment]),
  });
};

const RED = '#FF4C4C';
const ORANGE = '#FFA64C';
const BLUE = '#7CD197';

export default new ValidatedMethod({
  name: 'task.sendSlackMessage',
  validate: new SimpleSchema({
    parentId: String,
    taskId: String,
    type: String,
  }).validator(),
  run({ parentId, type, taskId }) {
    let parent = null;
    let parentType = null;

    if (parent = SalesRecords.findOne(parentId)) {
      parentType = 'salesrecord';
    } else {
      if (parent = Projects.findOne(parentId)) {
        parentType = 'project';
      }
    };

    if (parent) {
      const { slackChanel: channel } = parent;
      const { name, description: text, status, comments, assignee } = Tasks.findOne(taskId);
      const title_link = Meteor.absoluteUrl(`${parentType}/${parentId}`);
      const title = `Task: ${name}`;
      if (channel) {
        switch (type) {
          case 'ADD_COMMENT': {
            sendAttachment({
              pretext: `A comment has beed added`,
              title,
              text: _.last(comments).content,
              color: BLUE,
              channel,
            });
            break;
          }

          case 'REMOVE_FILE': {
            sendAttachment({
              pretext: `A attachment file has been removed`,
              title,
              text,
              color: RED,
              title_link,
              channel,
            });
            break;
          }

          case 'ATTACH_FILE': {
            sendAttachment({
              pretext: `A file have been attached`,
              title,
              text,
              color: BLUE,
              title_link,
              channel,
            });
            break;
          }

          case 'UPDATE_TASK': {
            sendAttachment({
              pretext: `A task have been updated at ${status} board`,
              title,
              text,
              color: ORANGE,
              title_link,
              channel,
            });
            break;
          }

          case 'REMOVE_TASK': {
            sendAttachment({
              pretext: `A task have been removed from ${status} board`,
              title,
              text,
              color: RED,
              title_link,
              channel,
            });
            break;
          }

          case 'NEW_TASK': {
            const { slack } = Meteor.users.findOne(assignee);
            let pretext = `New task has created in ${status} board`;
            (slack && slack.id) && (pretext = `New task has assigned to <@${slack.id}> in ${status} board`);
            sendAttachment({
              pretext,
              title,
              text,
              color: BLUE,
              title_link,
              channel,
            });
            break;
          }
        }
      }
    }
  },
});
