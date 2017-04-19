import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../lib/collections';

const removeTask = new ValidatedMethod({
  name: 'task.remove',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
  }).validator(),
  run({ _id }) {
    if (!this.userId) return;
    return Tasks.update(_id, {
      $set: {
        isRemoved: true,
      },
    });
  },
});
