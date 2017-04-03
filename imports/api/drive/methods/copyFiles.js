import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
    name: 'drive.copy',
    validate: new SimpleSchema({
        fileId: {
            type: String,
        },
        parentId: {
            type: String,
        }
    }).validator(),
    run({ fileId, parentId }) {
        const params = { fileId, addParents: parentId };
        return Meteor.wrapAsync(drive.files.update)(params);
    }
})

