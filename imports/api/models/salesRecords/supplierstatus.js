import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'

class SupplierStatusCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.created_at = ourDoc.created_at || new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}

const SupplierStatus = new SupplierStatusCollection('SupplierStatus')

// Deny all client-side updates since we will be using methods to manage this collection
SupplierStatus.deny({
    insert() {
        return true
    },
    update() {
        return true
    },
    remove() {
        return true
    }
})

SupplierStatus.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    editable: {type: Boolean, defaultValue:true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

SupplierStatus.attachSchema(SupplierStatus.schema)

SupplierStatus.publicFields = {
    name: 1,
    editable: 1,
    created_at: 1,
    modified_at: 1
}

Factory.define('supplierstatus', SupplierStatus, {
    name: faker.name.jobType()
})

SupplierStatus.helpers({
})

export default SupplierStatus
