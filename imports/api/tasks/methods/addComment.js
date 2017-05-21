import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';
import sendSlackMessage from './sendSlackMessage';

export default new ValidatedMethod({
  name: 'task.addComment',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    content: {
      type: String,
      min: 1,
    },
  }).validator(),
  run({ _id, content }) {
    if (!this.userId) throw new Error('User is not allowed to add comment');
    Tasks.update(_id, {
      $push: {
        comments: {
          userId: this.userId,
          content,
          _id: Random.id(),
          createdAt: new Date(),
        },
      },
    });
    const task = Tasks.findOne(_id);
    if (task) {
      Meteor.defer(()=> {
        sendSlackMessage.call({
          taskId: _id,
          parentId: task.parentId,
          type: 'ADD_COMMENT',
        });
      });
    }
  },
});
