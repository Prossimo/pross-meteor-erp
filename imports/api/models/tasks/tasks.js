import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import moment from 'moment'
import SalesRecords from '../salesRecords/salesRecords'
import Projects from '../projects/projects'

class TasksCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.created_at = new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}

const Tasks = new TasksCollection('Tasks')

export const TaskStatus = [
    'Idea',
    'To-Do',
    'In Progress',
    'Reviewing',
    'Complete',
    'Blocked',
]

export const TaskParentType = {
    deal: 'deal',
    project: 'project'
}
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

    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

Tasks.attachSchema(Tasks.schema)

Tasks.helpers({
    parent() {
        const salesRecord = SalesRecords.findOne(this.parentId)
        if (salesRecord) {
            salesRecord.type = 'deal'
            return salesRecord
        }

        const project = Projects.findOne(this.parentId)
        if (project) {
            project.type = 'project'
            return project
        }
        return null
    }
})

const applyFilter = ({ parentId, filter, userId }) => {
    const selector = {
        isRemoved: { $ne: true }
    }

    if (parentId && filter) {
        const {
            AssignToMe,
            DueDate,
            IamApprover,
            Today,
            Tomorrow,
        } = filter

        selector.parentId = parentId

        if (AssignToMe) selector.assignee = userId
        if (IamApprover) selector.approver = userId
        if (DueDate) selector.dueDate = {
            $lt: new Date()
        }
        if (Today) {
            const start = moment(`${moment().format('YYYY-MM-DD')} 00:00:00`).toDate()
            const end = moment(`${moment().format('YYYY-MM-DD')} 23:59:59`).toDate()
            selector.dueDate = {
                $gte: start,
                $lte: end
            }
        }

        if (Tomorrow) {
            const start = moment(`${moment().add(1, 'd').format('YYYY-MM-DD')} 00:00:00`).toDate()
            const end = moment(`${moment().add(1, 'd').format('YYYY-MM-DD')} 23:59:59`).toDate()
            selector.dueDate = {
                $gte: start,
                $lte: end
            }
        }
    }

    return selector
}

export {
    applyFilter
}
export default Tasks
