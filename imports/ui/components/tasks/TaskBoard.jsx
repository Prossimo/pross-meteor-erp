import React, { Component } from 'react';
import styled from 'styled-components';
import Tasks from '/imports/api/models/tasks/tasks';
import { createContainer } from 'meteor/react-meteor-data';
import TaskList from './TaskList.jsx';
import TaskFilter from './TaskFilter.jsx';
import { ReactiveDict } from 'meteor/reactive-dict';
import './TaskBoard.scss';

const taskFilter = new ReactiveDict();
taskFilter.set({
  AssignToMe: false,
  IamApprover: false,
  DueDate: false,
  Today: false,
  Tomorrow: false,
});

class TaskBoard extends Component {
  constructor() {
    super();
  }

  componentWillUnmount() {
    taskFilter.set({
      AssignToMe: false,
      IamApprover: false,
      DueDate: false,
      Today: false,
      Tomorrow: false,
    });
  }

  render() {
    const allowedStatus = [
      'Idea',
      'To-Do',
      'In Progress',
      'Reviewing',
      'Complete',
      'Blocked',
    ];
    return (
      <div className='task-board-container'>
        <TaskFilter taskFilter={taskFilter}/>
        <div className='col-md-12'>
          {
            allowedStatus.map(allowedStatus => {
              const tasks = this.props.tasks.filter(({ status })=> status === allowedStatus);
              const users = this.props.users;
              return <TaskList
                listName={allowedStatus}
                tasks={tasks}
                users={users}
                key={allowedStatus}
              />;
            })
          }
        </div>
      </div>
    );
  }
}

export default createContainer(() => {
  const subscribers = [];
  const parentId = FlowRouter.current().params.id;
  let loading = true;
  let tasks = [];
  const filter = taskFilter.all();
  subscribers.push(Meteor.subscribe('task.all', { parentId, filter }));
  loading = subscribers.reduce((result, subscriber)=> result && subscriber.ready(), true);
  tasks = Tasks.find().fetch();
  return {
    subscribers,
    loading,
    tasks,
    users: Meteor.users.find().fetch(),
  };
}, TaskBoard);
