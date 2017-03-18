import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';
import { ALL_ROLES } from '../../constants/roles';

Projects.schema = new SimpleSchema({
    _id: { type: String },

    // Basic Contact Information
    name: { type: String },
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
    twitter: { type: String, optional: true },
    facebook: { type: String, optional: true },
    linkedIn: { type: String, optional: true },

    // Application Specific Info
    roles: { type: Array , optional: true },
    'roles.$': { type: String, allowedValues: ALL_ROLES },

    // Emails
    emails: { type: Array },
    'emails.$.email': { type: String, regEx: SimpleSchema.RegEx.Email },
    'emails.$.type': { type: String, allowedValues: ['Main', 'Office', 'Personal'] },
    'emails.$.isDefault': { type: Boolean },

    // Phone Number
    phoneNumbers: { type: Array },
    'phoneNumbers.$.number': { type: String }, // TODO: add regex
    'phoneNumbers.$.extension': { type: String }, // TODO: add regex
    'phoneNumbers.$.type': { type: String, allowedValues: ['Office', 'Mobile', 'Home'] },
    'phoneNumbers.$.isDefault': { type: Boolean },

    // Company
    company: { type: Object },
    'company.name': { type: String },
    'company.position': { type: String },
});

Projects.attachSchema(Projects.schema);
