import _ from 'underscore'
import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import Users from '../users/users'

class ProjectsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.createdAt = ourDoc.createdAt || new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}
const Projects = new ProjectsCollection('Projects')

Projects.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },
    name: {type: String},
    members: {type: Array, defaultValue: []},
    'members.$': {type: Object},
    'members.$.userId': {type: String},
    'members.$.isAdmin': {type: Boolean},
    stakeholders: {type: Array, defaultValue: []},
    'stakeholders.$': {type: Object},
    'stakeholders.$.peopleId': {type: String},
    'stakeholders.$.isMainStakeholder': { type: Boolean },
    'stakeholders.$.addToMain': {type: Boolean},    // to main conversation
    slackChanel: {type: String, optional: true},
    slackChannelName: {type: String, optional: true},
    folderId: {type: String, optional: true},
    taskFolderId: {type: String, optional: true},
})

Projects.attachSchema(Projects.schema)

Projects.helpers({
    getMembers() {
        if (!this.members || this.members.length == 0) return []

        const memberIds = _.pluck(this.members, 'userId')
        return Users.find({_id:{$in:memberIds}}).fetch()
    }
})
export default Projects
