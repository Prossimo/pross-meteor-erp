import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import inviteUsers from "./inviteUsers";
import sendSlackMessage from "./sendSlackMessage";
import { Tasks, SalesRecords, Projects } from "../../models";

export default new ValidatedMethod({
  name: "task.create",
  validate: new SimpleSchema({
    tabName: {
      type: String,
      optional: true
    },
    name: {
      type: String,
      optional: true
    },
    assignee: {
      type: String,
      optional: true
    },
    approver: {
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
      taskOperators: [assignee, approver]
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
        const members = (salesrecord.members || []).filter(m => m !== null);
        if (assignee && assignee.length > 0 && members.indexOf(assignee) == -1)
          members.push(assignee);
        if (approver && approver.length > 0 && members.indexOf(approver) == -1)
          members.push(approver);
        SalesRecords.update(parentId, { $set: { members } });
      }
    } else if (parentType === "project") {
      const project = Projects.findOne(parentId);
      if (project) {
        const members = (project.members || []).filter(m => m !== null);
        if (
          assignee &&
          assignee.length > 0 &&
          members.map(m => m.userId).indexOf(assignee) == -1
        )
          members.push({ userId: assignee });
        if (
          approver &&
          approver.length > 0 &&
          members.map(m => m.userId).indexOf(approver) == -1
        )
          members.push({ userId: approver });
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
