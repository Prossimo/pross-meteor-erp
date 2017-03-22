import React, { Component } from 'react';
import { info, warning } from '/imports/api/lib/alerts';
import AutoFormWrapper from '../autoFormWrapper/AutoFormWrapper';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
        this.memberOptions = this.props.users.map(({ profile: { firstName, lastName }, _id })=> {
            const name = `${firstName} ${lastName}`;
            return {
                label: name,
                value: _id,
            }
        })
    }

    componentDidMount() {
        const _this = this;
        AutoForm.addHooks('new-project', {
            onSubmit(project) {
                this.event.preventDefault();
                Meteor.call('createNewProject', project, (error)=> {
                    //info(`Success add new project & integration with Slack`);
                    if (error) {
                        warning(`Problems with creating new project. ${error.error}`);
                        return this.done(error);
                    } else {
                        info(`Success add new project`);
                        return this.done();
                    }
                })
            },
            onSuccess() {
                return this.resetForm();
            },
        }, true);
    }

    render() {
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
                        options: this.memberOptions,
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
