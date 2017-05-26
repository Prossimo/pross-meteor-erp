import { SlackMessages, Projects } from '/imports/api/models';

Meteor.publish('project.slackMessages', function (projectId) {
  if (!Match.test(projectId, String)) return this.ready();
  const project = Projects.findOne(projectId);
  if (!project) return this.ready();
  return SlackMessages.find({ channel: project.slackChanel });
});
