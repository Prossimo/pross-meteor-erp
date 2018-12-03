import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { Tasks } from "../../models";
import sendSlackMessage from "./sendSlackMessage";

export default new ValidatedMethod({
  name: "task.remove",
  validate: new SimpleSchema({
    tabName: {
      type: String
    },
    _id: {
      type: String
    }
  }).validator(),
  run({ tabName, _id }) {
    if (!this.userId)
      throw new Meteor.Error(`You are not allowed to remove this ${tabName}`);
    Tasks.update(_id, {
      $set: {
        isRemoved: true
      }
    });
    const task = Tasks.findOne(_id);
    const actorId = this.userId;
    if (task) {
      Meteor.defer(() => {
        sendSlackMessage.call({
          tabName,
          taskId: _id,
          parentId: task.parentId,
          type: "REMOVE_TASK",
          actorId
        });
      });
    }
  }
});
