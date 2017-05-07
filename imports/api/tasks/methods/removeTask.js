import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';

const removeTask = new ValidatedMethod({
  name: 'task.remove',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
  }).validator(),
  run({ _id }) {
    if (!this.userId)
      throw new Meteor.Error('You are not allowed to remove this task');
    return Tasks.update(_id, {
      $set: {
        isRemoved: true,
      },
    });
  },
});
