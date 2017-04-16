import SimpleSchema from 'simpl-schema';
import Deals from '/imports/api/models/deals/deals'
import listFiles from './listFiles';
import copyFiles from './copyFiles';
import createFolder from './createFolder';
import { prossDocDrive } from '../../config/config';

const { dealParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
    name: 'drive.createDealFolder',
    validate: new SimpleSchema({
        name: { type: String },
        dealId: { type: String },
    }).validator(),
    run({ name, dealId }) {
        const dealName = `##### ${name}`;
        const { id } = createFolder.call({ name: dealName, parent: dealParentFolderId});
        SalesRecords.update(dealId, { $set: { folderId: id }});
        // copy template to new created folder
        const { files } = listFiles.call({ query: `'${prossDocDrive.templateFolderId}' in parents` });
        files.forEach((file)=> {
            copyFiles.call({ fileId: file.id, parentId: id });
        });
    },
})
