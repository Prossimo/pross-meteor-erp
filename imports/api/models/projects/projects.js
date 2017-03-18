import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';
import { ALL_ROLES } from '../../constants/roles';

const phoneNumberRegex = /^1(-\d{3}){3}$/;
const phoneExtensionRegex = /^(\d)+$/;

Projects.schema = new SimpleSchema({
    _id: { type: String },

    // Basic Contact Information
    name: {
        type: String,
        custom() {
            if (this.value) {
                if (this.value.split(' ').length < 2) return 'contactName';
            }
        }
    },
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
    twitter: { type: String },
    facebook: { type: String },
    linkedIn: { type: String },

    // Application Specific Info
    role: { type: String, allowedValues: ALL_ROLES },

    // Emails
    emails: { type: Array },
    'emails.$.email': { type: String, regEx: SimpleSchema.RegEx.Email },
    'emails.$.type': { type: String, allowedValues: ['Main', 'Office', 'Personal'] },
    'emails.$.isDefault': { type: Boolean },

    // Phone Number
    phoneNumbers: { type: Array },
    'phoneNumbers.$.number': { type: String , regEx: phoneNumberRegex},
    'phoneNumbers.$.extension': { type: String, regEx: phoneExtensionRegex},
    'phoneNumbers.$.type': { type: String, allowedValues: ['Office', 'Mobile', 'Home'] },
    'phoneNumbers.$.isDefault': { type: Boolean },

    // Company
    company: { type: Object },
    'company.name': { type: String },
    'company.position': { type: String },
});

Projects.attachSchema(Projects.schema);
