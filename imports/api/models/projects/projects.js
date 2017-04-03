import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';

Projects.schema = new SimpleSchema({
    _id: { type: String },
    members: {
        type: Array,
    },
    name: {
        type: String,
    },
    members: {
        type: Array,
    },
    'members.$': {
        type: Object,
    },
    'members.$.userId': {
        type: String,
    },
    'members.$.isAdmin': {
        type: Boolean,
        defaultValue: false,
    },
    folderId: {
        type: String,
        optional: true,
    }
});

Projects.attachSchema(Projects.schema);
