import {Roles} from 'meteor/alanning:roles'
import { SlackMessages, Projects, ROLES } from '/imports/api/models/index'


Meteor.publish('getNewProjects', function () {
    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find()
    return Projects.find({'members.userId': this.userId})
})


Meteor.publish('getNewProject', function (_id) {
    if (!Match.test(_id, String)) return this.ready()
    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find({_id})
    return Projects.find({_id, 'members.userId': this.userId})
})

Meteor.publish('project.slackMessages', function (projectId) {
  check(projectId, String)
  const project = Projects.findOne(projectId)
  if (!project) return this.ready()
  return SlackMessages.find({ channel: project.slackChanel }, {sort: { createdAt: -1 }})
})
