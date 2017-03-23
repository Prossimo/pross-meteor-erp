import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import { Tasks} from '/imports/api/lib/collections';
import { GET_TASKS} from '/imports/api/constants/collections';

class TasksView extends Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        this.props.subscribers.forEach((subscriber)=> subscriber.stop());
    }

    render() {
        return (
            <div className='container'>
                <form>
                    <div className='form-group'>
                        <input type='text' className='form-control' placeholder='Add your task content'/>
                    </div>
                </form>
            </div>
        )
    }
}

export default createContainer(({ projectId })=> {
    const subscribers = [];
    subscribers.push(Meteor.subscribe(GET_TASKS, projectId));
    return {
        subscribers,
        loading: !subscribers.reduce((prev, subscriber)=> prev && subscriber.ready(), true),
        task: Tasks.find().fetch()[0],
    };
}, TasksView);

