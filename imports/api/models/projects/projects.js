import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';
import { ALL_ROLES } from '../../constants/roles';
import {
    DESIGNATION_LIST,
    STAKEHOLDER_CATEGORY
} from '/imports/api/constants/project';

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
    'members.$.isMainStakeholder': {
        type: Boolean,
        defaultValue: false,
    },
    'members.$.designation': {
        type: String,
        allowedValues: DESIGNATION_LIST,
    },
    'members.$.categories': {
        type: Array,
    },
    'members.$.categories.$': {
        type: String,
        allowedValues: STAKEHOLDER_CATEGORY,
    },
    folderId: {
        type: String,
        optional: true,
    }
});

Projects.attachSchema(Projects.schema);
