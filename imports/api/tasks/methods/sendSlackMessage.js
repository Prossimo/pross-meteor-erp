import SimpleSchema from 'simpl-schema';
import { HTTP } from 'meteor/http';
import { SalesRecords, Projects, Tasks } from '/imports/api/models';
import { slack } from '/imports/api/config/config';

const { apiRoot, apiKey } = slack;
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
    const sendMessage = ({ channel, text, attachments })=> {
      const params = { token: apiKey, channel };
      text && (params.text = text);
      attachments && (params.attachments = attachments);
      HTTP.post(`${apiRoot}/chat.postMessage`, {
        params,
      });
    };

    if (parent = SalesRecords.findOne(parentId)) {
      parentType = 'salesrecord';
    } else {
      if (parent = Projects.findOne(parentId)) {
        parentType = 'project';
      }
    };

    if (parent) {
      const { slackChanel: channel } = parent;
      const { name, description, status, comments, assignee } = Tasks.findOne(taskId);
      if (channel) {
        switch (type) {
          case 'ADD_COMMENT': {
            const pretext = `A comment has beed added`;
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: _.last(comments).content,
              color: '#FF4C4C',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }

          case 'REMOVE_FILE': {
            let pretext = `A attachment file has been removed`;
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: description,
              color: '#FF4C4C',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }

          case 'ATTACH_FILE': {
            let pretext = `A file have been attached`;
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: description,
              color: '#FFA64C',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }

          case 'UPDATE_TASK': {
            let pretext = `A task have been updated at ${status} board`;
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: description,
              color: '#FFA64C',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }

          case 'REMOVE_TASK': {
            let pretext = `A task have been removed from ${status} board`;
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: description,
              color: '#FF4C4C',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }

          case 'NEW_TASK': {
            const { slack } = Meteor.users.findOne(assignee);
            let pretext = `New task has created in ${status} board`;
            (slack && slack.id) && (pretext = `New task has assigned to <@${slack.id}> in ${status} board`);
            const attachment = {
              pretext,
              title: `Task: ${name}`,
              text: description,
              color: '#7CD197',
              title_link: Meteor.absoluteUrl(`${parentType}/${parentId}`),
            };
            sendMessage({ channel, attachments: JSON.stringify([attachment]) });
            break;
          }
        }
      }
    }
  },
});
