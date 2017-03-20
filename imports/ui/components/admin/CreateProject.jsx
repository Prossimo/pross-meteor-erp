import React, { Component } from 'react';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
        //const messages = SimpleSchema._globalMessages;
        //messages.contactName = '[label] must be a valid name (First and Last name)';
        //messages.regEx.push({ exp: this.phoneNumberRegex, msg: '[label] must be a valid phone number (1-xxx-xxx-xxx)' });
        //messages.regEx.push({ exp: this.phoneExtensionRegex, msg: '[label] must be a valid phone number extension (only digit)'});
    }

    componentDidMount() {
        AutoForm.addHooks('new-project', {
            onSubmit(project) {
                _this = this;
                Meteor.call('createNewProject', project, (error)=> {
                    _this.event.preventDefault();
                    if (error) {
                        return _this.done(error);
                    }
                    return _this.done();
                })
            },
            onSuccess() {
                return this.resetForm();
            },
        }, true);
    }

    render() {
        const phoneNumberRegex = /^(\d)+$/;
        const newProjectSchema = {
            members: {
                type: [Object],
            },
            'members.$.name': {
                type: String,
                label: 'Name',
            },
            'members.$.isMainStakeholder': {
                type: Boolean,
                defaultValue: false,
                label: 'Main Stakeholder',
            },
            'members.$.designation': {
                type: String,
                allowedValues: [
                    'Standard',
                    'Guest'
                ],
                label: 'Designation',
            },
            'members.$.categories': {
                type: [String],
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
                ],
                label: 'Categories',
            },
            shippingAddress: {
                type: String,
                label: 'Shipping Address',
            },
            shippingContactName: {
                type: String,
                label: 'Shipping Contact Name',
            },
            shippingContactPhone: {
                type: String,
                regEx: phoneNumberRegex,
                label: 'Shipping Contact Phone',
            },
            shippingContactEmail: {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Shipping Contact Email',
            },
            shippingNotes: {
                type: String,
                label: 'Shipping Notes',
            },
            billingContactName: {
                type: String,
                label: 'Billing Contact Name',
            },
            billingContactPhone: {
                type: String,
                regEx: phoneNumberRegex,
                label: 'Billing Contact Phone',
            },
            billingContactEmail: {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Billing Contact Email',
            },
            billingAddress: {
                type: String,
            },
            billingNotes: {
                type: String,
                label: 'Billing Address',
            },
            supplier: {
                type: String,
                label: 'Supplier',
            },
            shippingMode: {
                type: String,
                allowedValues: [
                    'LCL',
                    'FCL',
                    'FCL Pallets',
                    'Courrier'
                ],
                label: 'Shipping Mode',
            },
            estDeliveryRange: {
                type: Array,
            },
            'estDeliveryRange.$': {
                type: Date,
                label: 'Est Delivery Range'
            },
            actualDeliveryDate: {
                type: Date,
                label: 'Actual Delivery Date',
            },
            productionStartDate: {
                type: Date,
                label: 'Actual Start Date',
            },
            shipper: {
                type: String,
                label: 'Shipper',
            }
        }
        return (
            <div>
                <AutoFormWrapper
                    schema={new SimpleSchema(newProjectSchema)}
                    id='new-project'
                />
            </div>
        );
    }
}
