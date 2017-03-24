import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import { Tasks} from '/imports/api/lib/collections';
import { GET_TASKS} from '/imports/api/constants/collections';

const items = new ReactiveVar([]);

class TasksView extends Component {
    constructor(props) {
        super(props);
        this.addItem = this.addItem.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.state = {
            optimisticItems: [],
        }
    }

    componentWillUnmount() {
        this.props.subscribers.forEach((subscriber)=> subscriber.stop());
    }

    addItem(event) {
        event.preventDefault();
        const content = event.target.content.value;
        const { project: { id } } = this.props.task;
        const itemId = Meteor.uuid();

        if (content) {
            event.target.content.value = '';
            this.setState(({ optimisticItems })=> {
                optimisticItems.push({
                    content,
                    id: itemId,
                });
                return {
                    optimisticItems,
                }
            });
            Meteor.call('task.newItem', content, id, (error, remoteItem)=> {
                this.setState(({ optimisticItems })=> {
                    optimisticItems = optimisticItems.filter(({ id })=> id !== itemId)
                    return {
                        optimisticItems,
                    };
                });
            });
        }
    }

    renderItems() {
        let items = this.props.task.items || [];
        this.state.optimisticItems.forEach((item)=> {
            items.push(item);
        });
        return (
            <div>
            {
                items.map(({ id, content })=> {
                    return (
                        <div className='checkbox' key={id}>
                            <label>
                                <input type='checkbox'/> { content }
                            </label>
                        </div>
                    );
                })
            }
            </div>
        )
    }

    render() {
        return (
            <div className='container'>
                {
                    (this.props.loading) ? (
                        <div>Loading</div>
                    ) : (
                        (this.props.task) ? (
                            <form onSubmit={this.addItem}>
                                <div className='form-group'>
                                    <input type='text' className='form-control' name='content' placeholder='Add your task content'/>
                                </div>
                                { this.renderItems() }
                            </form>
                        ) : (
                            <div> There is no availabe task for this project </div>
                        )
                    )
                }
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

