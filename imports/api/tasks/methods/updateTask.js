import { ValidatedMethod } from "meteor/mdg:validated-method";
//import SimpleSchema from "simpl-schema";
import inviteUsers from "./inviteUsers";
import { Tasks, SalesRecords, Projects } from "../../models";
import sendSlackMessage from "./sendSlackMessage";
import union from "lodash/union";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";

export default new ValidatedMethod({
  name: "task.update",
  validate: Tasks.schema.validator(),
  run(task) {
    if (!this.userId) return;
    const { tabName, assignee, approver, parentId } = task;
    inviteUsers.call({
      parentId,
      taskOperators: union(assignee, approver)
    });
    const oldVersionTask = Tasks.findOne(task._id);

    delete task.created_at;
    task.modified_at = new Date();

    // ASSIGN TASK TO USER
    Tasks.update(task._id, {
      $set: task
    });

    // Add approver and assignee as teamMember to project or deal
    if (task.parentType === "deal") {
      const salesrecord = SalesRecords.findOne(parentId);
      if (salesrecord) {
        let members = compact(salesrecord.members || []);
        members = union(members, assignee, approver);

        SalesRecords.update(parentId, { $set: { members } });
      }
    } else if (task.parentType === "project") {
      const project = Projects.findOne(parentId);

      if (project) {
        let members = compact(project.members || []);
        const memberIds = members.map(m => m.userId);

        if (!isEmpty(assignee)) {
          assignee.map(assignee => {
            if (!memberIds.includes(assignee))
              members.push({ userId: assignee });
          });
        }
        if (!isEmpty(approver)) {
          approver.map(approver => {
            if (!memberIds.includes(approver))
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
      // !isEmpty(oldVersionTask.assignee) &&
      !isEmpty(task.assignee) &&
      !isEqual(sortBy(oldVersionTask.assignee), sortBy(task.assignee)) //true)
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
