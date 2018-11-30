import React, { Component } from "react";
import PropTypes from "prop-types";
import Task from "./Task";
import TaskAdding from "./TaskAdding";

class TaskList extends Component {
  handleDrop = event => {
    const task = JSON.parse(event.dataTransfer.getData("task"));
    task.dueDate = new Date(task.dueDate);
    task.status = this.props.listName;
    task.created_at = new Date(task.created_at);
    task.modified_at = new Date();
    delete task.attachments;
    delete task.comments;

    Meteor.call("task.update", task);
  };

  render() {
    return (
      <div
        className="col-md-2 column-container"
        onDrop={this.handleDrop}
        onDragOver={event => event.preventDefault()}
      >
        <div className="column-wrapper">
          <div className="column-header">
            {this.props.listName}
            <div className="task-action">
              <i className="fa fa-ellipsis-h" />
            </div>
          </div>
          <div>
            tasks list
            {this.props.tasks.map(task => {
              const assignee = this.props.users.find(
                ({ _id }) => _id === task.assignee
              );
              const approver = this.props.users.find(
                ({ _id }) => _id === task.approver
              );
              return (
                <Task
                  key={task._id}
                  task={task}
                  assignee={assignee}
                  approver={approver}
                  taskFolderId={this.props.taskFolderId}
                  total={this.props.total}
                />
              );
            })}
          </div>
          <TaskAdding
            tabName={this.props.tabName}
            status={this.props.listName}
            taskFolderId={this.props.taskFolderId}
            total={this.props.total}
          />
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
  total: PropTypes.number.isRequired
};

export default TaskList;
