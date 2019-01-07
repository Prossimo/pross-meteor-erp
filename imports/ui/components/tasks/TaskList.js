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
            {/* TODO: ???maybe task.assignee and task.approver below were enouth, and users.filter isnt necessary */}
            {this.props.tasks.map(task => {
              const assignee = this.props.users.filter(
                ({ _id }) => task.assignee && task.assignee.includes(_id)
              );
              const assigneeIds =
                assignee && assignee.map(assignee => assignee._id);

              const approver = this.props.users.filter(
                ({ _id }) => task.approver && task.approver.includes(_id)
              );
              const approverIds =
                approver && approver.map(approver => approver._id);

              return (
                <Task
                  key={task._id}
                  task={task}
                  assignee={assigneeIds}
                  approver={approverIds}
                  taskFolderId={this.props.taskFolderId}
                  total={this.props.total}
                  //projectId={this.props.projectId}
                />
              );
            })}
          </div>
          <TaskAdding
            tabName={this.props.tabName}
            status={this.props.listName}
            taskFolderId={this.props.taskFolderId}
            total={this.props.total}
            //projectId={this.props.projectId}
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
  //projectId: PropTypes.string
};

export default TaskList;
