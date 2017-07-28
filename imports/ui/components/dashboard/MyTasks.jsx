/* global moment */
import {Roles} from 'meteor/alanning:roles'
import React, {Component, PropTypes} from 'react'
import {Panel, Table, Dropdown, MenuItem} from 'react-bootstrap'
import {createContainer} from 'meteor/react-meteor-data'
import Tasks, {TaskStatus} from '/imports/api/models/tasks/tasks'
import {getUserName} from '/imports/api/lib/filters'
import {ROLES} from '/imports/api/models'
import {CustomToggle} from '../common'

class MyTasks extends Component {
    constructor(props) {
        super()
        this.renderTasks = this.renderTasks.bind(this)

        this.state = {
            showAllTasks: false,
            hideCompletedTasks: false,
            sort: {
                by: 'dueDate',
                asc: false
            }
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

    getSortedData() {
        const tasks = this.getTasks()
        const {by, asc} = this.state.sort

        const sort = () => _.sortBy(tasks, t => {
            if(by === 'parentId') {
                return t.parent() ? t.parent().name : ''
            } else if(by === 'assignee') {
                const assignee = _.findWhere(this.props.users, {_id:t.assignee})
                const assigneeName = assignee ? getUserName(assignee) : ''
                return assigneeName
            } else if(by === 'approver') {
                const approver = _.findWhere(this.props.users, {_id:t.approver})
                const approverName = approver ? getUserName(approver) : ''
                return approverName
            } else {
                return t[by]
            }
        })

        if(asc) {
            return sort()
        } else {
            return sort().reverse()
        }
    }

    sortBy = (field) => {
        const {by, asc} = this.state.sort

        if(by == field) this.setState({sort:{by, asc:!asc}})
        else this.setState({sort:{by:field, asc:true}})
    }

    onMouseEnterStatus = (task) => {
        if(this.state.hoverStatusTask && this.state.hoverStatusTask._id === task._id) return

        this.setState({
            hoverStatusTask: task
        })
    }

    onMouseLeaveStatus = (task) => {
        this.setState({hoverStatusTask:null})
    }

    selectStatusForTask = (task, status) => {
        if(task.status === status) return
        task.status = status

        Meteor.call('task.update', {...task}, (err, res) => {
            if (err) {
                return console.error(err)
            }
        })
    }

    renderStatusSelector(task) {
        return (
            <Dropdown id="task-status-selector" style={{float:'right'}} pullRight>
                <CustomToggle bsRole="toggle">
                    <i className="fa fa-cog"/>
                </CustomToggle>
                <Dropdown.Menu>
                {
                    TaskStatus.map((s,i) => (<MenuItem key={`status-${i}`} eventKey={i} onSelect={() => this.selectStatusForTask(task, s)}>{s}</MenuItem>))
                }
                </Dropdown.Menu>
            </Dropdown>
        )
    }
    renderTasks() {
        const tasks = this.getSortedData()
        const {users, userId} = this.props
        const {hoverStatusTask} = this.state

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
                    <td style={{width:150}} onMouseEnter={() => {this.onMouseEnterStatus(task)}} onMouseLeave={() => {this.onMouseLeaveStatus(task)}}>{task.status}{hoverStatusTask&&hoverStatusTask._id===task._id&&this.renderStatusSelector(task) }</td>
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
        const {by, asc} = this.state.sort
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
        const sortIcon = (field) => {
            if(by === field && asc) return <i style={{marginLeft:5}} className="fa fa-caret-up"/>
            else if(by === field && !asc) return <i style={{marginLeft:5}} className="fa fa-caret-down"/>
            else return ''
        }

        return (
            <div className="my-tasks">
                <Panel header={header}>
                    All tasks assigned from/to you.
                    <Table responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th onClick={() => this.sortBy('name')}>Name{sortIcon('name')}</th>
                            <th onClick={() => this.sortBy('status')}>Status{sortIcon('status')}</th>
                            <th onClick={() => this.sortBy('parentId')}>Deal/Project{sortIcon('parentId')}</th>
                            <th colSpan={2}>Desciption</th>
                            <th onClick={() => this.sortBy('assignee')}>Assignee{sortIcon('assignee')}</th>
                            <th onClick={() => this.sortBy('approver')}>Approver{sortIcon('approver')}</th>
                            <th onClick={() => this.sortBy('dueDate')}>DueDate{sortIcon('dueDate')}</th>
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
