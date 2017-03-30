import SimpleSchema from 'simpl-schema';
import createFolder from './createFolder';
import { prossDocDrive } from '../../config/config';

const { salesRecordParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
    name: 'drive.createSalesRecordFolder',
    validate: new SimpleSchema({
        name: { type: String },
    }).validator(),
    run({ name }) {
        const salesRecordName = `00[##### ${name}]`;
        return createFolder.call({ name: salesRecordName, parent: salesRecordParentFolderId});
    },
})
