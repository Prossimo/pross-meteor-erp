import SimpleSchema from "simpl-schema";
import { Tasks } from "../../models";
import sendSlackMessage from "./sendSlackMessage";
import { ValidatedMethod } from "meteor/mdg:validated-method";

export default new ValidatedMethod({
  name: "task.addComment",
  validate: new SimpleSchema({
    // tabName: {
    //   type: String,
    //   optional: true
    // },
    _id: {
      type: String
    },
    content: {
      type: String,
      min: 1
    },
    parentId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ _id, content, parentId }) {
    if (!this.userId) throw new Error("User is not allowed to add comment");
    Tasks.update(_id, {
      $push: {
        comments: {
          userId: this.userId,
          //tabName,
          content,
          parentId,
          _id: Random.id(),
          createdAt: new Date()
        }
      }
    });
    const task = Tasks.findOne(_id);
    const actorId = this.userId;
    if (task) {
      Meteor.defer(() => {
        sendSlackMessage.call({
          //tabName,
          taskId: _id,
          parentId: task.parentId,
          type: "ADD_COMMENT",
          actorId
        });
      });
    }
  }
});
