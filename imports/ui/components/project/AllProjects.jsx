import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import { GET_NEW_PROJECTS } from '/imports/api/constants/collections';
import { Projects } from '/imports/api/lib/collections';
import Sheets from '/imports/ui/components/libs/Sheets';

class AllProjects extends Component {
    constructor(props) {
        super(props);
        this.possibleColumns = [
            {
                key: '_id',
                label: 'ID',
                type: 'text',
                selected: false,
                editable: false,
            }, {
                key: 'name',
                label: 'Name',
                type: 'text',
                selected: false,
                editable: true,
            },
            {
                key: 'productionStartDate',
                label: 'Start Date',
                selected: false,
                type: 'date',
                editable: true,
            },
            {
                key: 'actualDeliveryDate',
                label: 'Delivery Date',
                selected: false,
                type: 'date',
                editable: true,
            },
            {
                key: 'shippingContactEmail',
                label: 'Shipping Email',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shippingAddress',
                label: 'Shipping Address',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shippingContactPhone',
                label: 'Shipping Phone',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shippingNotes',
                label: 'Shipping Notes',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'billingContactName',
                label: 'Billing Contact',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'billingContactEmail',
                label: 'Billing Email',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'billingAddress',
                label: 'Billing Address',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'billingContactPhone',
                label: 'Billing Phone',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'billingNotes',
                label: 'Billing Notes',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shippingMode',
                label: 'Shipping Mode',
                selected: false,
                type: 'select',
                options: [
                    'LCL',
                    'FCL',
                    'FCL Pallets',
                    'Courrier'
                ].map((value)=> ({label: value, value})),
                editable: true,
            },
            {
                key: 'supplier',
                label: 'Supplier',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shipper',
                label: 'Shipper',
                selected: false,
                type: 'text',
                editable: true,
            },
            {
                key: 'shippingContactName',
                label: 'Shipping Name',
                selected: false,
                type: 'text',
                editable: true,
            }
        ];
        this.saveProjectProperty = this.saveProjectProperty.bind(this);
    }

    componentWillUnmount() {
        this.props.subscribers.forEach((subscriber)=> subscriber.stop());
    }

    saveProjectProperty(projectId, { key, value }, callback) {
        Meteor.call('updateNewProjectProperty', projectId, { key, value }, (error)=> {
            if (error) {
                error.reason = `Problems with updating project. ${error.error}`
                callback && callback(error);
            } else {
                callback && callback(null, 'Success update project attributes')
            }
        });
    }

    render() {
        return (
            <div>
            {
                (this.props.loading) ? (
                    <div>Loading ...</div>
                ) : (
                    <Sheets
                        rows={this.props.projects}
                        columns={this.possibleColumns}
                        onSave={this.saveProjectProperty}
                        settingKey={'newProject'}
                    />
                )
            }
            </div>
        )
    }
}

export default createContainer(function() {
    const subscribers = [];
    subscribers.push(Meteor.subscribe(GET_NEW_PROJECTS));
    return {
        subscribers,
        loading: !subscribers.reduce((prev, subscriber)=> prev && subscriber.ready(), true),
        projects: Projects.find().fetch(),
    };
}, AllProjects);
