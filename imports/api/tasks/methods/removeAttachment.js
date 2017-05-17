import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../models';
import { prossDocDrive } from '/imports/api/drive';

export default new ValidatedMethod({
  name: 'task.removeAttachment',
  validate: new SimpleSchema({
    _id: String,
    fileId: String,
  }).validator(),
  run({ _id, fileId }) {
    console.log('LOL');
    Tasks.update(_id, {
      $pull: {
        attachments: {
          _id: fileId,
        },
      },
    });
    prossDocDrive.removeFiles({ fileId: fileId });
  },
});
