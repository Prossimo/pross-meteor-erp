import SimpleSchema from 'simpl-schema';
import { Projects } from '../../lib/collections';
import { ALL_ROLES } from '../../constants/roles';

const phoneNumberRegex = /^(\d)+$/;

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
    },
    shippingAddress: {
        type: String,
    },
    shippingContactName: {
        type: String,
    },
    shippingContactPhone: {
        type: String,
        regEx: phoneNumberRegex,
    },
    shippingContactEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
    },
    shippingNotes: {
        type: String,
    },
    billingContactName: {
        type: String,
    },
    billingContactPhone: {
        type: String,
        regEx: phoneNumberRegex,
    },
    billingContactEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
    },
    billingAddress: {
        type: String,
    },
    billingNotes: {
        type: String,
    },
    supplier: {
        type: String,
    },
    shippingMode: {
        type: String,
        allowedValues: [
            'LCL',
            'FCL',
            'FCL Pallets',
            'Courrier'
        ]
    },
    estDeliveryRange: {
        type: Array,
    },
    'estDeliveryRange.$': {
        type: Date,
    },
    actualDeliveryDate: {
        type: Date,
    },
    productionStartDate: {
        type: Date,
    },
    shipper: {
        type: String,
    }
});

Projects.attachSchema(Projects.schema);
