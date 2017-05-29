import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';

export default new ValidatedMethod({
  name: 'task.removeComment',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
  }).validator(),
  run({ _id }) {
    if (!this.userId) throw new Error('User is not allowed to add comment');
    const isRemoved = Tasks.update({}, {
      $pull: {
        comments: {
          userId: this.userId,
          _id,
        },
      },
    }, { multi: true });

    if (isRemoved) {
      Tasks.update({}, {
        $pull: {
          comments: {
            parentId: _id,
          },
        },
      });
    }
  },
});
