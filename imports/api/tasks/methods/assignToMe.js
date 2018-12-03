import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { Tasks } from "../../models";
import inviteUsers from "./inviteUsers";
import sendSlackMessage from "./sendSlackMessage";

export default new ValidatedMethod({
  name: "task.assignToMe",
  validate: new SimpleSchema({
    _id: String,
    tabName: String
  }).validator(),
  run({ tabName, _id }) {
    if (!this.userId) return;
    const task = Tasks.findOne(_id);
    if (task) {
      const { approver, parentId } = task;
      inviteUsers.call({
        parentId,
        taskOperators: [this.userId, approver]
      });
      Tasks.update(_id, {
        $set: {
          assignee: this.userId
        }
      });
      const actorId = this.userId;
      Meteor.defer(() => {
        sendSlackMessage.call({
          tabName,
          taskId: _id,
          parentId,
          type: "UPDATE_TASK",
          actorId
        });
      });
    }
  }
});
