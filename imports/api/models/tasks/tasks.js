import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import SalesRecords from '../salesRecords/salesRecords'
import Projects from '../projects/projects'

const Tasks = new Mongo.Collection('Tasks')

export const TaskStatus = [
    'Idea',
    'To-Do',
    'In Progress',
    'Reviewing',
    'Complete',
    'Blocked',
]

Tasks.schema = new SimpleSchema({
    _id: {
        type: String,
    },
    name: {
        type: String,
    },
    assignee: {
        type: String,
        optional: true,
    },
    approver: {
        type: String,
        optional: true,
    },
    description: {
        type: String,
        optional: true,
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        allowedValues: TaskStatus,
    },
    parentId: {
        type: String,
    },
    parentType: {
        type: String,
        optional: true,
        allowedValues: [
            'project',
            'deal'
        ]
    },
    isRemoved: {
        type: Boolean,
        optional: true,
        defaultValue: false,
    },
    comments: {
        type: Array,
        optional: true,
    },
    'comments.$': {
        type: Object,
    },
    'comments.$._id': {
        type: String,
    },
    'comments.$.parentId': {
        type: String,
        optional: true,
    },
    'comments.$.userId': {
        type: String,
    },
    'comments.$.content': {
        type: String,
    },
    'comments.$.createdAt': {
        type: Date,
    },
    'comments.$.updatedAt': {
        type: Date,
        optional: true,
    },
    attachments: {
        type: Array,
        optional: true,
    },
    'attachments.$': {
        type: Object,
    },
    'attachments.$._id': {
        type: String,
    },
    'attachments.$.mimeType': {
        type: String,
    },
    'attachments.$.name': {
        type: String,
    },
    'attachments.$.createdAt': {
        type: Date,
    },
})

Tasks.attachSchema(Tasks.schema)

Tasks.helpers({
    parent() {
        const salesRecord = SalesRecords.findOne(this.parentId)
        if (salesRecord) return salesRecord

        const project = Projects.findOne(this.parentId)
        if (project) return project
        return null
    }
})
export default Tasks
