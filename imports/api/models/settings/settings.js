import SimpleSchema from 'simpl-schema';
import { Settings } from '../../lib/collections';

Settings.schema = new SimpleSchema({
    _id: {
        type: String,
    },
    'project.show': {
        type: [String],
    }
});

Settings.attachSchema(Settings.schema);
