import { drive } from './drive';
import SimpleSchema from 'simpl-schema';
import listFiles from './listFiles';

export default new ValidatedMethod({
    name: 'drive.getFolderId',
    validate: new SimpleSchema({
        name: { type: String },
    }).validator(),
    run({ name }) {
        const folderName = `00[##### ${name}]`;
        const result = listFiles.call({ query: `name = '${folderName}'` });
        if (result && result.files && result.files.length > 0) return result.files[0].id;
        throw new Meteor.Error('Folder is not found');
    }
});
