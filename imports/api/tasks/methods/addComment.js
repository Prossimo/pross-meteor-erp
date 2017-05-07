import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';

export default new ValidatedMethod({
  name: 'task.addComment',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    content: {
      type: String,
    }
  }).validator(),
  run({ _id, content }) {
    if (!this.userId) throw new Error('User is not allowed to add comment');
    return Tasks.update(_id, {
      $push: {
        comments: {
          userId: this.userId,
          content,
        }
      }
    });
  }
})
