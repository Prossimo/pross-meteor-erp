import SimpleSchema from 'simpl-schema';
import { SalesRecords, Settings } from '/imports/api/models';
import listFiles from './listFiles';
import copyFiles from './copyFiles';
import createFolder from './createFolder';

export default new ValidatedMethod({
  name: 'drive.createSalesRecordFolder',
  validate: new SimpleSchema({
    name: { type: String },
    salesRecordId: { type: String },
  }).validator(),
  run({ name, salesRecordId }) {
    const { value: salesRecordParentFolderId } = Settings.findOne({ key: 'DEAL_ROOT_FOLDER' });
    const { value: dealTempletFolder } = Settings.findOne({ key: 'DEAL_TEMPLATE_FOLDER' });
    const salesRecordName = `##### ${name}`;
    const taskName = `Tasks`;
    const { id: folderId } = createFolder.call({ name: salesRecordName, parent: salesRecordParentFolderId });
    const { id: taskFolderId } = createFolder.call({ name: taskName, parent: folderId });
    SalesRecords.update(salesRecordId, {
      $set: {
        folderId,
        taskFolderId,
      },
    });

    // copy template to new created folder
    const { files } = listFiles.call({ query: `'${dealTempletFolder}' in parents` });
    files.forEach((file)=> {
      copyFiles.call({ fileId: file.id, parentId: folderId });
    });
  },
});
