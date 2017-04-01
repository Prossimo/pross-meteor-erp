import SimpleSchema from 'simpl-schema';
import { SalesRecords } from '../../lib/collections';
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
    },
})
