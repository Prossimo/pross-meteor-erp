import React, { Component } from 'react';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        AutoForm.addHooks('new-project', {
            onSubmit(error) {
                this.event.preventDefault();
                if (error) {
                    return this.done(error);
                }
                return this.done();
            },
            onSuccess() {
                return this.resetForm();
            },
            onError(name, errors) {
                //if (errors) {
                    //errors.validationErrors.forEach(({ name, type, value })=> {
                        //this.addStickyValidationError(name, type, value);
                    //})
                //}
            }
        }, true);
    }

    render() {
        const newProjectSchema = {
            name: {
                type: String,
                label: 'Name',
            },
            email: {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                label: 'Email Address'
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
     //Basic Contact Information
    //name: { type: String },
    //email: { type: String, regEx: SimpleSchema.RegEx.Email },
    //twitter: { type: String, optional: true },
    //facebook: { type: String, optional: true },
    //linkedIn: { type: String, optional: true },

     //Application Specific Info
    //roles: { type: Array , optional: true },
    //'roles.$': { type: String, allowedValues: ALL_ROLES },

     //Emails
    //emails: { type: Array },
    //'emails.$.email': { type: String, regEx: SimpleSchema.RegEx.Email },
    //'emails.$.type': { type: String, allowedValues: ['Main', 'Office', 'Personal'] },
    //'emails.$.isDefault': { type: Boolean },

     //Phone Number
    //phoneNumbers: { type: Array },
    //'phoneNumbers.$.number': { type: String },  TODO: add regex
    //'phoneNumbers.$.extension': { type: String },  TODO: add regex
    //'phoneNumbers.$.type': { type: String, allowedValues: ['Office', 'Mobile', 'Home'] },
    //'phoneNumbers.$.isDefault': { type: Boolean },

     //Company
    //company: { type: Object },
    //'company.name': { type: String },
    //'company.position': { type: String },
