import { drive } from './drive'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
    name: 'drive.updateFolderName',
    validate: new SimpleSchema({
        folderId: {type: String},
        name: { type: String }
    }).validator(),
    run({ folderId, name }) {
        const params = {
            fileId: folderId,
            resource: {
                name
            },

        }
        return Meteor.wrapAsync(drive.files.update)(params)
    }
})


