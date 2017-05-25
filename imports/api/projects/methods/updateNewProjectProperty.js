import { ADMIN_ROLE_LIST } from '/imports/api/constants/roles';
import { Projects } from '/imports/api/models';

Meteor.methods({
  updateNewProjectProperty(projectId, property) {
    check(projectId, String);
    check(property, {
      key: String,
      value: Match.OneOf(String, Date)
    });
    const {key, value} = property;

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const project = Projects.findOne(projectId);
    if (!project) throw new Meteor.Error('Project does not exists');
    const isMember = !!project.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return Projects.update(projectId, {
      $set: {
        [key]: value,
      }
    });
  }
})