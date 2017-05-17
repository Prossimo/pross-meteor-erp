import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'drive.getFiles',
  validate: new SimpleSchema({
    fileId: { type: String },
  }).validator(),
  run({ fileId }) {
    const params = {
      fileId,
      fields: 'kind,id,name,mimeType,webContentLink',
    };
    return Meteor.wrapAsync(drive.files.get)(params);
  },
});
