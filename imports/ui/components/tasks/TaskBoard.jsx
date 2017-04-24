import React, { Component } from 'react';
import styled from 'styled-components';
import { Tasks } from '/imports/api/lib/collections';
import { createContainer } from 'meteor/react-meteor-data';
import TaskList from './TaskList.jsx';

class TaskBoard extends Component {
  constructor() {
    super();
  }

  render() {
    const ColumnContainer = styled.div `
      padding-left: 15px;
      padding-right: 0px;
    `;
    const ColumnWrapper = styled.div `
      background-color: #e2e4e6;
      padding: 10px;
      color: #4d4d4d;
      border-radius: 2px;
    `;
    const ColumnHeader = styled.div `
      font-weight: 500;
    `;
    const TaskContainer = styled.div `
      background-color: white;
      padding: 8px;
      border-radius: 2px;
      color: #4d4d4d;
      font-weight: 400;
      font-size: 13px;
      margin-bottom: 7px;
      &:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }
    `;
    const TaskAction = styled.div `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      text-align: center;
      color: #999;
      &:hover {
        background-color: #CDD2D4;
        border-radius: 3px;
        cursor: pointer;
      }
    `;
    const TaskAdding = styled.div `
      font-size: 13px;
      padding: 5px;
      &:hover {
        background-color: #CDD2D4;
        cursor: pointer;
      }
    `;
    const AssigneeIcon = styled.div `
      width: 25px;
      height: 20px;
      background-color: #ccc;
      text-align: center;
      font-weight: 400;
      border-radius: 3px;
    `;

    const allowedStatus = [
      'Idea',
      'To-Do',
      'In Progress',
      'Reviewing',
      'Complete',
      'Blocked',
    ];
    return (
      <div>
        <div className='col-md-12'>
          {
            allowedStatus.map(allowedStatus => {
              const tasks = this.props.tasks.filter(({ status })=> status === allowedStatus);
              return <TaskList
                listName={allowedStatus}
                tasks={tasks}
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
  subscribers.push(Meteor.subscribe('task.all', { parentId }));
  loading = subscribers.reduce((result, subscriber)=> result && subscriber.ready(), true);
  tasks = Tasks.find().fetch();
  return {
    subscribers,
    loading,
    tasks,
  };
}, TaskBoard);
