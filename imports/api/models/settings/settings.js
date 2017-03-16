import SimpleSchema from 'simpl-schema';
import { Settings } from '../../lib/collections';

Settings.schema = new SimpleSchema({
    _id: {
        type: String,
    },
    key: {
        type: String,
        allowedValues: ['salesRecord']
    },
    show: {
        type: Array,
    },
    'show.$': {
        type: String,
    }
});

Settings.attachSchema(Settings.schema);
