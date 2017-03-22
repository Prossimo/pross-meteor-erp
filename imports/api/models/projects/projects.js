import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';
import { ALL_ROLES } from '../../constants/roles';

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
        allowedValues: ['Standard', 'Guest']
    },
    'members.$.categories': {
        type: Array,
    },
    'members.$.categories.$': {
        type: String,
        allowedValues: [
            'Architect',
            'Developers',
            'GC',
            'Contractor',
            'Installer',
            'Owner',
            'Consultant'
        ]
    }
});

Projects.attachSchema(Projects.schema);
