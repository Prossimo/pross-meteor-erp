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
    parentType: String,
  }).validator(),
  run({ parentId, type, taskId, parentType }) {
    const sendMessage = ({ channel, text, attachments })=> {
      const params = { token: apiKey, channel };
      text && (params.text = text);
      attachments && (params.attachments = attachments);
      HTTP.post(`${apiRoot}/chat.postMessage`, {
        params,
      });
    };

    const parent = SalesRecords.findOne(parentId) || Projects.findOne(parentId);
    if (parent) {
      const { slackChanel: channel } = parent;
      if (channel) {
        switch (type) {
          case 'NEW_TASK':
            const { name, description, assignee, status } = Tasks.findOne(taskId);
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
  },
});
