import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Tasks from '/imports/api/models/tasks/tasks'
import SaleRecords from '/imports/api/models/salesRecords/salesRecords'
import Projects from '/imports/api/models/projects/projects'
import { createContainer } from 'meteor/react-meteor-data'
import TaskList from './TaskList.jsx'
import TaskFilter from './TaskFilter.jsx'
import { ReactiveDict } from 'meteor/reactive-dict'
import './TaskBoard.scss'

const taskFilter = new ReactiveDict()
taskFilter.set({
  AssignToMe: false,
  IamApprover: false,
  DueDate: false,
  Today: false,
  Tomorrow: false,
})

class TaskBoard extends Component {
  constructor() {
    super()
  }

  componentWillUnmount() {
    taskFilter.set({
      AssignToMe: false,
      IamApprover: false,
      DueDate: false,
      Today: false,
      Tomorrow: false,
    })
    this.props.subscribers.forEach(sub => sub.stop())
  }

  render() {
    const allowedStatus = [
      'Idea',
      'To-Do',
      'In Progress',
      'Reviewing',
      'Complete',
      'Blocked',
    ]
    return (
      <div className='task-board-container flex column'>
        <TaskFilter taskFilter={taskFilter}/>
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

export default createContainer(() => {
  const subscribers = []
  const parentId = FlowRouter.current().params.id
  let loading = true
  let tasks = []
  const filter = taskFilter.all()
  const { taskFolderId } = SaleRecords.findOne(parentId) || Projects.findOne(parentId)
  subscribers.push(Meteor.subscribe('task.all', { parentId, filter }))
  loading = subscribers.reduce((result, subscriber) => result && subscriber.ready(), true)
  tasks = Tasks.find({ parentId, isRemoved:{$ne:true} }).fetch()
  return {
    subscribers,
    loading,
    tasks,
    users: Meteor.users.find().fetch(),
    taskFolderId,
  }
}, TaskBoard)
