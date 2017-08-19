import _ from 'underscore'
import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import Users from '../users/users'
import People from '../people/people'

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

    conversationIds: {type: Array, optional:true},
    'conversationIds.$': {type: String, regEx: SimpleSchema.RegEx.Id},
})

Projects.attachSchema(Projects.schema)

Projects.helpers({
    getMembers() {
        if (!this.members || this.members.length == 0) return []

        const memberIds = _.pluck(this.members, 'userId')
        return Users.find({_id:{$in:memberIds}}).fetch()
    },

    getStakeholders() {
        if(!this.stakeholders || this.stakeholders.length == 0) return []

        const peopleIds = _.pluck(this.stakeholders, 'peopleId')
        //console.log(JSON.stringify({_id: {$in:peopleIds}}))
        return People.find({_id: {$in:peopleIds}}).map(p => {
            const stakeholder = _.findWhere(this.stakeholders, {peopleId:p._id})
            return {...p, email:p.defaultEmail(), designation:p.designation()?p.designation().name:null, isMainStakeholder:stakeholder.isMainStakeholder, addToMain:stakeholder.addToMain}
        })
    },
    people() {
        const peopleIds = _.pluck(this.stakeholders, 'peopleId')
        return People.find({_id:{$in:peopleIds}}).fetch()
    }
})
export default Projects
