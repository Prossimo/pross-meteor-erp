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
        this.handleCheck = this.handleCheck.bind(this);
        this.addOptimisticItem = this.addOptimisticItem.bind(this);
        this.removeOptimisticItem = this.removeOptimisticItem.bind(this);
        this.mergeWithOptimisticItems = this.mergeWithOptimisticItems.bind(this);
        this.state = {
            optimisticItems: [],
        }
    }

    componentWillUnmount() {
        this.props.subscribers.forEach((subscriber)=> subscriber.stop());
    }

    addOptimisticItem(item, type) {
        item.type = type;
        this.setState(({ optimisticItems })=> {
            optimisticItems.push(item);
            return {
                optimisticItems,
            }
        });
    }

    removeOptimisticItem(itemId) {
        console.log('>> ready');
        this.setState(({ optimisticItems })=> {
            optimisticItems = optimisticItems.filter(({ id })=> id !== itemId)
            return {
                optimisticItems,
            };
        });
    }

    mergeWithOptimisticItems() {
        let items = this.props.task.items || [];
        this.state.optimisticItems.forEach((item)=> {
            switch(item.type) {
                case 'add':
                    items.push(item);
                    break;
                case 'mod':
                    items = items.map((remoteItem)=> {
                        if (remoteItem.id === item.id) {
                            return item;
                        } else {
                            return remoteItem;
                        }
                    })
            }
        });
        return items;
    }

    addItem(event) {
        event.preventDefault();
        const content = event.target.content.value;
        const { project: { id } } = this.props.task;
        const itemId = Meteor.uuid();

        if (content) {
            event.target.content.value = '';
            this.addOptimisticItem({
                content,
                id: itemId,
            }, 'add');
            Meteor.call('task.newItem', content, id, (error, item)=> {
                this.removeOptimisticItem(itemId);
            });
        }
    }

    handleCheck(item, isChecked) {
        if (isChecked) {
            item.checked = 1;
            this.addOptimisticItem(item, 'mod');
            Meteor.call('task.complete', item.id, (error, result)=> {
                this.removeOptimisticItem(item.id);
            });
        }
    }

    renderItems() {
        const items = this.mergeWithOptimisticItems();
        return (
            <div>
            {
                items.map((item)=> {
                    return (
                        <div className='checkbox' key={item.id}>
                            <label>
                                <input
                                    type='checkbox'
                                    onChange={(event)=> this.handleCheck(item, event.target.checked)}
                                    checked={ item.checked === 1 }
                                />
                                { item.content }
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

