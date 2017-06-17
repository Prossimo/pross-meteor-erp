/* global moment */
import React, { Component, PropTypes } from 'react'
import {Panel, Table} from 'react-bootstrap'
import { createContainer } from 'meteor/react-meteor-data'
import Tasks from '/imports/api/models/tasks/tasks'
import { getUserName } from '/imports/api/lib/filters'

class MyTasks extends Component {
  constructor() {
    super()
    this.renderTasks = this.renderTasks.bind(this)
  }
  renderTasks() {
    const { tasks, users, userId } = this.props

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
          <td colSpan={2}>{task.description}</td>
          <td>{assignee && assignee._id ===  userId ? 'You' : assigneeName }</td>
          <td>{approver && approver._id ===  userId ? 'You' : approverName }</td>
          <td style={{color: isOverDate ? 'red': ''}}>
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
    return (
      <div>
        <Panel collapsible defaultExpanded header="My Tasks">
          All tasks assigned from/to you.
          <Table responsive>
             <thead>
               <tr>
                 <th>#</th>
                 <th>Name</th>
                 <th>Status</th>
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
  subscribers.push(Meteor.subscribe('task.byUserId'))
  loading = subscribers.reduce((result, subscriber) => result && subscriber.ready(), true)
  tasks = Tasks.find({$or: [{assignee: userId}, {approver: userId}]}).fetch()
  return {
    loading,
    tasks,
    userId,
    users: Meteor.users.find().fetch(),
  }
}, MyTasks)
