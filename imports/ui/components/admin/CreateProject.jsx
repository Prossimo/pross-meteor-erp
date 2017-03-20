import React, { Component } from 'react';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
        this.onRendered = this.onRendered.bind(this);
        this.estDeliveryRange = [];
    }

    componentDidMount() {
        const _this = this;
        AutoForm.addHooks('new-project', {
            onSubmit(rawProject) {
                this.event.preventDefault();
                let project = _.pick(rawProject,
                    'actualDeliveryDate',
                    'members',
                    'productionStartDate',
                    'shipper',
                    'shippingMode',
                    'supplier',
                    'name',
                )
                const { shipping, billing } = rawProject;
                _.extend(project, {
                    shippingAddress: shipping.address,
                    shippingContactName: shipping.contactName,
                    shippingContactPhone: shipping.contactPhone,
                    shippingContactEmail: shipping.contactEmail,
                    shippingNotes: shipping.notes,
                    billingAddress: billing.address,
                    billingContactName: billing.contactName,
                    billingContactPhone: billing.contactPhone,
                    billingContactEmail: billing.contactEmail,
                    billingNotes: billing.notes,
                    estDeliveryRange: _this.estDeliveryRange,
                });
                console.log(project);
                Meteor.call('createNewProject', project, (error)=> {
                    if (error) {
                        return this.done(error);
                    }
                    return this.done();
                })
            },
            onSuccess() {
                return this.resetForm();
            },
        }, true);
    }

    onRendered() {
        $('input[name="estDeliveryRange"]').daterangepicker();
        $('input[name="estDeliveryRange"]').on('apply.daterangepicker', (ev, picker)=> {
            const startDate = picker.startDate.toDate();
            const endDate = picker.endDate.toDate();
            this.estDeliveryRange = [startDate, endDate];
        })
    }

    render() {
        const phoneNumberRegex = /^(\d)+$/;
        const memberOptions = this.props.users.map(({ profile: { firstName, lastName }, _id })=> {
            const name = `${firstName} ${lastName}`;
            return {
                label: name,
                value: _id,
            }
        })
        const newProjectSchema = {
            name: {
                type: String,
                label: 'Project Name',
            },
            members: {
                type: [Object],
            },
            'members.$.userId': {
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
