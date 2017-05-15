import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';

export default new ValidatedMethod({
  name: 'task.attachFiles',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    attachments: {
      type: Array,
    },
    'attachments.$': {
      type: Object,
    },
    'attachments.$._id': {
      type: String,
    },
    'attachments.$.name': {
      type: String,
    },
    'attachments.$.mimeType': {
      type: String,
    },
  }).validator(),
  run({ _id, attachments }) {
    attachments.forEach(attachment => attachment.createdAt = new Date());
    return Tasks.update(_id, {
      $push: {
        attachments: {
          $each: attachments,
        },
      },
    });
  },
});
