import React, { Component } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Tasks, { applyFilter } from '/imports/api/models/tasks/tasks'
import SaleRecords from '/imports/api/models/salesRecords/salesRecords'
import Projects from '/imports/api/models/projects/projects'
import { withTracker } from 'meteor/react-meteor-data'
import TaskList from './TaskList.jsx'
import TaskFilter from './TaskFilter.jsx'
import store from '/imports/redux/store'
import {activeTask} from '/imports/redux/actions'
import {ReactiveDict} from 'meteor/reactive-dict'
import './TaskBoard.scss'

const defaultFilterState = {
    AssignToMe: false,
    IamApprover: false,
    DueDate: false,
    Today: false,
    Tomorrow: false
}
const allowedStatus = [
    'Idea',
    'To-Do',
    'In Progress',
    'Reviewing',
    'Complete',
    'Blocked',
]
const taskFilter = new ReactiveDict(defaultFilterState)

class TaskBoard extends Component {
    componentWillUnmount() {
        taskFilter.set(defaultFilterState)
        this.props.subscribers.forEach(sub => sub.stop())
    }

    render() {
        return (
            <div className='task-board-container flex column'>
                <TaskFilter taskFilter={taskFilter} />
                <div className='col-md-12 flex-1'>
                    {
                        allowedStatus.map(allowedStatus => {
                            const tasks = this.props.tasks.filter(({ status }) => status === allowedStatus)
                            const users = this.props.users
                            const taskFolderId = this.props.taskFolderId
                            return <TaskList
                                listName={allowedStatus}
                                tasks={tasks}
                                users={users}
                                key={allowedStatus}
                                taskFolderId={taskFolderId}
                                total={this.props.tasks.length}
                            />
                        })
                    }
                </div>
            </div>
        )
    }
}

export default withTracker(() => {
    const subscribers = []
    const parentId = FlowRouter.current().params.id
    const taskId = FlowRouter.current().params.taskId
    if (taskId) {
        store.dispatch(activeTask(taskId))
    } else {
        store.dispatch(activeTask(null))
    }
    let loading = true
    let tasks = []
    const filter = taskFilter.all()
    const { taskFolderId } = SaleRecords.findOne(parentId) || Projects.findOne(parentId)
    subscribers.push(Meteor.subscribe('task.all', { parentId, filter }))
    loading = subscribers.reduce((result, subscriber) => result && subscriber.ready(), true)
    tasks = Tasks.find(applyFilter({ parentId, filter, userId: Meteor.userId() })).fetch()
    return {
        subscribers,
        loading,
        tasks,
        users: Meteor.users.find().fetch(),
        taskFolderId,
    }
})(TaskBoard)
