import _ from 'underscore'
import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import Users from '../users/users'

const Projects = new Mongo.Collection('Projects')

Projects.schema = new SimpleSchema({
    _id: {type: String},
    name: {
        type: String,
    },
    members: {
        type: Array,
        defaultValue: []
    },
    'members.$': {
        type: Object,
    },
    'members.$.userId': {
        type: String,
    },
    'members.$.isAdmin': {
        type: Boolean,
    },
    slackChanel: {
        type: String,
        optional: true,
    },
    folderId: {
        type: String,
        optional: true,
    },
    taskFolderId: {
        type: String,
        optional: true,
    },
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
