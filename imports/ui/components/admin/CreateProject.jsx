import React, { Component } from 'react';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
        this.phoneNumberRegex = /^1(-\d{3}){3}$/;
        this.phoneExtensionRegex = /^(\d)+$/;
        const messages = SimpleSchema._globalMessages;
        messages.contactName = '[label] must be a valid name (First and Last name)';
        messages.regEx.push({ exp: this.phoneNumberRegex, msg: '[label] must be a valid phone number (1-xxx-xxx-xxx)' });
        messages.regEx.push({ exp: this.phoneExtensionRegex, msg: '[label] must be a valid phone number extension (only digit)'});
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
        const allowedEmailTypes = ['Main', 'Office', 'Personal'];
        const allowedPhonetypes = ['Office', 'Mobile', 'Home'];
        const newProjectSchema = {
            name: {
                type: String,
                label: 'Name',
                max: 250,
                custom() {
                    if (this.value) {
                        if(this.value.split(' ').length < 2) return 'contactName';
                    }
                }
            },
            email: {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Email Address',
                autoform: {
                    type: 'email',
                }
            },
            twitter: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
                label: 'Twitter',
            },
            facebook: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
                label: 'Facebook',
            },
            linkedIn: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
                label: 'LinkedIn',
            },
            emails: {
                type: [ Object ],
            },
            'emails.$.email': {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Email Address',
                autoform: {
                    type: 'email',
                }
            },
            'emails.$.type': {
                type: String,
                allowedValues: allowedEmailTypes,
                label: 'Email Type',
                autoform: {
                    options: allowedEmailTypes.map((item)=> ({ label: item, value: item })),
                }
            },
            'emails.$.isDefault': {
                type: Boolean,
                label: 'Is Default',
                autoform: {
                    afFieldInput: {
                        type: 'boolean-checkbox',
                    }
                }
            },
            phoneNumbers: {
                type: [ Object ],
            },
            'phoneNumbers.$.number': {
                type: String,
                label: 'Phone Number',
                regEx: this.phoneNumberRegex,
                autoform: {
                    afFieldInput: {
                        type: 'tel',
                    }
                }
            },
            'phoneNumbers.$.extension': {
                type: String,
                label: 'Phone Extension',
                regEx: this.phoneExtensionRegex,
            },
            'phoneNumbers.$.type': {
                type: String,
                label: 'Phone Type',
                allowedValues: allowedPhonetypes,
                autoform: {
                    options: allowedPhonetypes.map((item)=> ({label: item, value: item})),
                }
            },
            'phoneNumbers.$.isDefault': {
                type: Boolean,
                label: 'Is Default',
                autoform: {
                    afFieldInput: {
                        type: 'boolean-checkbox',
                    }
                }
            },
            company: {
                type: Object,
            },
            'company.name': {
                type: String,
                label: 'Company Name',
            },
            'company.position': {
                type: String,
                label: 'Company Position',
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
