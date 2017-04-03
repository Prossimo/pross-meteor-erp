import SimpleSchema from 'simpl-schema';
import SalesRecords from '/imports/api/models/salesRecords/salesRecords'
import listFiles from './listFiles';
import copyFiles from './copyFiles';
import createFolder from './createFolder';
import { prossDocDrive } from '../../config/config';

const { salesRecordParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
    name: 'drive.createSalesRecordFolder',
    validate: new SimpleSchema({
        name: { type: String },
        salesRecordId: { type: String },
    }).validator(),
    run({ name, salesRecordId }) {
        const salesRecordName = `00[##### ${name}]`;
        const { id } = createFolder.call({ name: salesRecordName, parent: salesRecordParentFolderId});
        SalesRecords.update(salesRecordId, { $set: { folderId: id }});
        // copy template to new created folder
        const { files } = listFiles.call({ query: `'${prossDocDrive.templateFolderId}' in parents` });
        files.forEach((file)=> {
            copyFiles.call({ fileId: file.id, parentId: id });
        });
    },
})
