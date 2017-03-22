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
            //{
                //key: 'shippingMode',
                //label: 'Shipping Mode',
                //selected: false,
                //type: 'select',
                //options: [
                    //'LCL',
                    //'FCL',
                    //'FCL Pallets',
                    //'Courrier'
                //].map((value)=> ({label: value, value})),
                //editable: true,
            //},
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

    goTo(project) {
        FlowRouter.go('Project', {id: project._id})
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
                        goTo={this.goTo}
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
