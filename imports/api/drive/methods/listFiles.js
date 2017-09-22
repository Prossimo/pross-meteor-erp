import { drive } from './drive'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
    name: 'drive.listFiles',
    validate: new SimpleSchema({
        query: { type: String, optional: true }
    }).validator(),
    run({ query, parent }) {
        const params = query ? { q: query } : {}
        params.fields = 'files'
        return Meteor.wrapAsync(drive.files.list)(params)
    }
})


