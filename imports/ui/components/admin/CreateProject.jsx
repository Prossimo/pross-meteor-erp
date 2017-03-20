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

    onRendered() {
        $('input[name="estDeliveryRange"').daterangepicker();
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
                autoform: {
                    type: 'boolean-checkbox',
                }
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
            shipping: {
                type: Object,
            },
            'shipping.address': {
                type: String,
                label: ' Address',
            },
            'shipping.contactName': {
                type: String,
                label: 'Contact Name',
            },
            'shipping.contactPhone': {
                type: String,
                regEx: phoneNumberRegex,
                label: 'Contact Phone',
            },
            'shipping.contactEmail': {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Contact Email',
            },
            'shipping.notes': {
                type: String,
                label: 'Notes',
                autoform: {
                    afFieldInput: {
                        type: 'textarea',
                        rows: 3,
                    }
                }
            },
            billing: {
                type: Object,
            },
            'billing.contactName': {
                type: String,
                label: 'Contact Name',
            },
            'billing.contactPhone': {
                type: String,
                regEx: phoneNumberRegex,
                label: 'Contact Phone',
            },
            'billing.contactEmail': {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Contact Email',
            },
            'billing.address': {
                type: String,
                label: 'Address',
            },
            'billing.notes': {
                type: String,
                label: 'Notes',
                autoform: {
                    type: 'textarea',
                    rows: 3,
                }
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
                autoform: {
                    type: 'selectize',
                }
            },
            estDeliveryRange: {
                type: String,
                label: 'Est Delivery Range',
            },
            actualDeliveryDate: {
                type: Date,
                label: 'Actual Delivery Date',
                autoform: {
                    type: 'bootstrap-datepicker',
                    datePickerOptions: {
                        autoclose: true
                    }
                }
            },
            productionStartDate: {
                type: Date,
                label: 'Actual Start Date',
                autoform: {
                    type: 'bootstrap-datepicker',
                    datePickerOptions: {
                        autoclose: true
                    }
                }
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
                    onRendered={this.onRendered}
                />
            </div>
        );
    }
}
