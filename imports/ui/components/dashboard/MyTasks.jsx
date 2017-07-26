/* global moment */
import {Roles} from 'meteor/alanning:roles'
import React, {Component, PropTypes} from 'react'
import {Panel, Table} from 'react-bootstrap'
import {createContainer} from 'meteor/react-meteor-data'
import Tasks from '/imports/api/models/tasks/tasks'
import {getUserName} from '/imports/api/lib/filters'
import {ROLES} from '/imports/api/models'

class MyTasks extends Component {
    constructor(props) {
        super()
        this.renderTasks = this.renderTasks.bind(this)

        this.state = {
            showAllTasks: false,
            hideCompletedTasks: false
        }
    }

    componentWillReceiveProps(newProps) {
        console.log('componentWillReceiveProps')
        const {hideCompletedTasks} = this.state
        this.setState({tasks: hideCompletedTasks ? newProps.tasks.filter(t => t.status !== 'Complete') : newProps.tasks})
    }

    getTasks() {
        const {hideCompletedTasks, showAllTasks} = this.state

        const tasks = showAllTasks ? Tasks.find().fetch() : this.props.tasks

        return hideCompletedTasks ? tasks.filter(t => t.status !== 'Complete') : tasks
    }

    toggleHideCompletedTasks = (e) => {
        const checked = e.target.checked
        this.setState({
            hideCompletedTasks: checked
        })
    }

    toggleShowAllTasks = (e) => {
        const checked = e.target.checked
        this.setState({
            showAllTasks: checked
        })
    }

    renderTasks() {
        const tasks = this.getTasks()
        const {users, userId} = this.props

        return tasks.map((task, index) => {
            const assignee = users.filter(u => u._id === task.assignee)[0]
            const assigneeName = assignee ? getUserName(assignee) : ''
            const approver = users.filter(u => u._id === task.approver)[0]
            const approverName = approver ? getUserName(approver) : ''
            const formatedDate = moment(task.dueDate).format('MM/DD/YYYY')
            const isOverDate = moment('MM/DD/YYYY').isBefore(formatedDate)

            return (
                <tr key={task._id}>
                    <td>{index + 1}</td>
                    <td>{task.name}</td>
                    <td>{task.status}</td>
                    <td>{task.parent() && task.parent().name}</td>
                    <td colSpan={2}>{task.description}</td>
                    <td>{assignee && assignee._id === userId ? 'You' : assigneeName}</td>
                    <td>{approver && approver._id === userId ? 'You' : approverName}</td>
                    <td style={{color: isOverDate ? 'red' : ''}}>
                        {formatedDate}
                    </td>
                    <td>
                        <a href={`/${task.parentType}/${task.parentId}`}>View</a>
                    </td>
                </tr>
            )
        })
    }

    render() {
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>
                    My Tasks
                </div>
                <div>
                    {Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) && <span><input type="checkbox" value={this.state.showAllTasks}
                                                                                  onChange={this.toggleShowAllTasks}/>&nbsp;Show all tasks&nbsp;&nbsp;</span>}
                    <input type="checkbox" value={this.state.hideCompletedTasks}
                           onChange={this.toggleHideCompletedTasks}/>&nbsp;Hide completed tasks
                </div>
            </div>
        )
        return (
            <div>
                <Panel header={header}>
                    All tasks assigned from/to you.
                    <Table responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Deal/Project</th>
                            <th colSpan={2}>Desciption</th>
                            <th>Assignee</th>
                            <th>Approver</th>
                            <th>DueDate</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.renderTasks()}
                        </tbody>
                    </Table>
                </Panel>
            </div>
        )
    }
}

export default createContainer(() => {
    const userId = Meteor.userId()
    const subscribers = []
    let loading = true
    let tasks = []
    if(Roles.userIsInRole(userId, ROLES.ADMIN)) {
        subscribers.push(Meteor.subscribe('task.all', {parentId:null, filter:null}))
    } else {
        subscribers.push(Meteor.subscribe('task.byUserId'))
    }
    loading = subscribers.reduce((result, subscriber) => result && subscriber.ready(), true)
    tasks = Tasks.find({$or: [{assignee: userId}, {approver: userId}]}).fetch()
    return {
        loading,
        tasks,
        userId,
        users: Meteor.users.find().fetch(),
    }
}, MyTasks)
