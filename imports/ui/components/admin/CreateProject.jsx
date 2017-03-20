import React, { Component } from 'react';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
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
        const memberOptions = this.props.users.map(({ profile: { firstName, lastName } })=> {
            const name = `${firstName} ${lastName}`;
            return {
                label: name,
                value: name,
            }
        })
        const newProjectSchema = {
            members: {
                type: [Object],
            },
            'members.$.name': {
                type: String,
                label: 'Name',
                autoform: {
                    type: 'selectize',
                    afFieldInput: {
                        options: memberOptions,
                    }
                }
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
                autoform: {
                    type: 'selectize',
                }
            },
            'members.$.categories': {
                type: [String],
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
                autoform: {
                    type: 'selectize',
                    multiple: true,
                }
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
