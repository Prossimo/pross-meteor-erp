import { EMPLOYEE_ROLE, ADMIN_ROLE_LIST } from '/imports/api/constants/roles';
import { Projects } from '/imports/api/models';
import { prossDocDrive } from '/imports/api/drive';

Meteor.methods({
  createNewProject(project) {
    if (!Roles.userIsInRole(this.userId, [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) {
      throw new Meteor.Error('Access denied');
    }
    check(project, {
      name: String,
      members: [{
        userId: String,
        isAdmin: Boolean,
      }],
    });
    const projectId = Projects.insert(project);
    Meteor.defer(()=> {
      prossDocDrive.createProjectFolder.call({ name: project.name, projectId });
    });
    return projectId;
  }
})