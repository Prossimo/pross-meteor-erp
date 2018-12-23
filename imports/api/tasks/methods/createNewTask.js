import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import inviteUsers from "./inviteUsers";
import sendSlackMessage from "./sendSlackMessage";
import { Tasks, SalesRecords, Projects, Users } from "../../models";
import union from "lodash/union";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
export default new ValidatedMethod({
  name: "task.create",
  validate: new SimpleSchema({
    tabName: {
      type: String,
      optional: true
    },
    // projectId: {
    //   type: String,
    //   optional: true
    // },
    name: {
      type: String,
      optional: true
    },
    assignee: {
      type: Array,
      optional: true
    },
    "assignee.$": {
      type: String,
      optional: true
    },
    approver: {
      type: Array,
      optional: true
    },
    "approver.$": {
      type: String,
      optional: true
    },
    description: {
      type: String,
      optional: true
    },
    dueDate: {
      type: Date,
      optional: true
    },
    status: {
      type: String,
      allowedValues: [
        "Idea",
        "To-Do",
        "In Progress",
        "Reviewing",
        "Complete",
        "Blocked"
      ],
      optional: true
    },
    parentId: {
      type: String
    },
    parentType: {
      type: String
    }
  }).validator(),
  run(task) {
    if (!this.userId) return;
    const {
      tabName,
      name,
      parentId,
      parentType,
      assignee,
      approver,
      dueDate,
      status
    } = task;
    inviteUsers.call({
      parentId,
      taskOperators: union(assignee, approver)
    });
    if (!name) {
      task.name = `${tabName} #${Tasks.find({ parentId, parentType }).fetch()
        .length + 1}`;
    }
    if (!dueDate) {
      task.dueDate = new Date();
    }
    if (!status) {
      task.status = "Idea";
    }

    const _id = Tasks.insert(task);

    // Add approver and assignee as teammember to project or deal
    if (parentType === "deal") {
      const salesrecord = SalesRecords.findOne(parentId);
      if (salesrecord) {
        let members = compact(salesrecord.members || []);
        members = union(members, assignee, approver);

        SalesRecords.update(parentId, { $set: { members } });
      }
    } else if (parentType === "project") {
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

    // Send slack message
    const actorId = this.userId;
    Meteor.defer(() => {
      sendSlackMessage.call({
        taskId: _id,
        parentId,
        type: "NEW_TASK",
        tabName,
        actorId
      });
    });
    return _id;
  }
});
