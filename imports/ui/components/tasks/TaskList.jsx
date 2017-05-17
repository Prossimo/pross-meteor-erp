import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import Task from './Task.jsx';
import TaskAdding from './TaskAdding.jsx';

class TaskList extends Component {
  constructor() {
    super();
    this.handleDrop = this.handleDrop.bind(this);
  }

  componentWillUnmount() {
    console.log('UNMOUNT');
  }

  handleDrop(event) {
    const task = JSON.parse(event.dataTransfer.getData('task'));
    task.dueDate = new Date(task.dueDate);
    task.status = this.props.listName;
    delete task.attachments;
    delete task.comments;
    Meteor.call('task.update', task);
  }

  render() {
    return (
      <div
        className='col-md-2 column-container'
        onDrop={ this.handleDrop }
        onDragOver={event => event.preventDefault()}
      >
        <div className='column-wrapper'>
          <div className='column-header'>
            { this.props.listName }
            <div className='task-action'>
              <i className='fa fa-ellipsis-h'/>
            </div>
          </div>
          <div>
            {
              this.props.tasks.map((task)=> {
                const assignee = this.props.users.find(({ _id }) => _id === task.assignee);
                const approver = this.props.users.find(({ _id }) => _id === task.approver);
                return <Task
                  key={task._id}
                  task={task}
                  assignee={assignee}
                  approver={approver}
                  taskFolderId={this.props.taskFolderId}
                />;
              })
            }
          </div>
          <TaskAdding status={this.props.listName} taskFolderId={this.props.taskFolderId}/>
        </div>
      </div>
    );
  }
}

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  listName: PropTypes.string.isRequired,
  taskFolderId: PropTypes.string,
};

export default TaskList;

