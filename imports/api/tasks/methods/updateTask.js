import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import inviteUsers from "./inviteUsers";
import { Tasks, SalesRecords, Projects } from "../../models";
import sendSlackMessage from "./sendSlackMessage";
import _ from "lodash";

export default new ValidatedMethod({
  name: "task.update",
  validate: Tasks.schema.validator(),
  run(task) {
    if (!this.userId) return;
    const { tabName, assignee, approver, parentId } = task;
    inviteUsers.call({
      parentId,
      taskOperators: _.union(assignee, approver)
    });
    const oldVersionTask = Tasks.findOne(task._id);

    delete task.created_at;
    task.modified_at = new Date();

    // ASSIGN TASK TO USER
    Tasks.update(task._id, {
      $set: task
    });

    // Add approver and assignee as teammember to project or deal
    if (task.parentType === "deal") {
      const salesrecord = SalesRecords.findOne(parentId);
      if (salesrecord) {
        let members = _.compact(salesrecord.members || []);
        members = _.union(members, assignee, approver);

        SalesRecords.update(parentId, { $set: { members } });
      }
    } else if (task.parentType === "project") {
      const project = Projects.findOne(parentId);
      if (project) {
        const members = _.compact(project.members || []).map(m => m.userId);

        if (!_.isEmpty(assignee)) {
          assignee.map(assignee => {
            if (!members.map(m => m.userId).includes(assignee))
              members.push({ userId: assignee });
          });
        }
        if (!_.isEmpty(approver)) {
          approver.map(approver => {
            if (!members.map(m => m.userId).includes(approver))
              members.push({ userId: approver });
          });
        }

        Projects.update(parentId, { $set: { members } });
      }
    }

    let type = "UPDATE_TASK";
    const actorId = this.userId;
    if (
      oldVersionTask &&
      !_.isEmpty(oldVersionTask.assignee) &&
      !_.isEmpty(task.assignee)
    ) {
      type = "ASSIGN_TASK";
    }
    Meteor.defer(() => {
      sendSlackMessage.call({
        tabName,
        taskId: task._id,
        parentId,
        type,
        actorId
      });
    });
  }
});
