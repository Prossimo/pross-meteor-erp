import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../lib/collections';

Tasks.schema = new SimpleSchema({
    _id: { type: String },

    project: { type: Object },
    'project.name': { type: String, optional: true },
    'project.color': { type: Number, optional: true },
    'project.is_deleted': { type: Number, optional: true },
    'project.collapsed': { type: Number, optional: true },
    'project.inbox_project': { type: Boolean, optional: true },
    'project.parent_id': { type: Number, optional: true },
    'project.item_order': { type: Number, optional: true },
    'project.indent': { type: Number, optional: true },
    'project.id': { type: Number, optional: true },
    'project.shared': { type: Boolean, optional: true },
    'project.is_archived': { type: Number, optional: true },
    'project.team_inbox': { type: Boolean, optional: true },

    items: { type: Array, optional: true },
    'items.$': { type:  Object, optional: true },
    'items.$.id': { type: String, optional: true },
    'items.$.user_id': { type: Number, optional: true },
    'items.$.project_id': { type: Number, optional: true },
    'items.$.content': { type: String, optional: true },
    'items.$.date_string': { type: String, optional: true },
    'items.$.date_lang': { type: String, optional: true },
    'items.$.due_data_utc': { type: String, optional: true },
    'items.$.priority': { type: Number, optional: true },
    'items.$.indent': { type: Number, optional: true },
    'items.$.item_order': { type: Number, optional: true },
    'items.$.day_order': { type: Number, optional: true },
    'items.$.collapsed': { type: Number, optional: true },
    'items.$.labels': { type: Array, optional: true },
    'items.$.labels.$': { type: String, optional: true },
    'items.$.assigned_by_uid': { type: Number, optional: true },
    'items.$.responsible_uid': { type: Number, optional: true },
    'items.$.checked': { type: Number, optional: true },
    'items.$.in_history': { type: Number, optional: true },
    'items.$.is_deleted': { type: Number, optional: true },
    'items.$.is_archived': { type: Number, optional: true },
    'items.$.sync_id': { type: Number, optional: true },
    'items.$.date_added': { type: String, optional: true },
});

Tasks.attachSchema(Tasks.schema);
