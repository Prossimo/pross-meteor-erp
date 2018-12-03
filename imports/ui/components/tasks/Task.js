import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import styled from "styled-components";
import TaskModifying from "./TaskModifying";
import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AssigneeIcon = styled.div`
  width: 35px;
  height: 20px;
  background-color: #519839;
  text-align: center;
  font-weight: bold;
  border-radius: 3px;
  overflow-x: hidden;
  position: relative;
  float: right;
  margin-left: 2px;
  color: white;
`;

const ApproverIcon = styled.div`
  width: 35px;
  height: 20px;
  background-color: #ccc;
  text-align: center;
  font-weight: bold;
  border-radius: 3px;
  overflow-x: hidden;
  position: relative;
  float: right;
  margin-left: 2px;
`;

const CloseButton = styled.a`
  position: absolute;
  top: 0px;
  right: 5px;
  font-size: 1.5em;
  color: black;
`;

const DueDateIcon = styled(ApproverIcon)`
  float: left;
  width: 80px;
  background-color: ${({ status, dueDate }) =>
    status === "Complete"
      ? "#ccc"
      : dueDate.valueOf() >= Date.now()
      ? "#0079BF"
      : "#EB5A46"};
  color: white;
`;

class Task extends Component {
  shortenName({ profile: { firstName, lastName } }) {
    return `${firstName} ${lastName}`
      .split(" ")
      .reduce((result, next) => `${result}${next.charAt(0)}`, "");
  }

  showDetail = () => {
    this.refs.taskModifying.showDetail();
  };

  closeTask = (tabName, _id, event) => {
    event.preventDefault();
    event.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!"
    }).then(() => {
      Meteor.call("task.remove", { tabName, _id }, error => {
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          swal("Delete task failed", msg, "warning");
        }
      });
      swal("Removed!", "Your task has been removed.", "success");
    });
  };

  render() {
    const { task } = this.props;

    return (
      <div
        className="task-container"
        onClick={this.showDetail}
        draggable="true"
        onDragStart={event =>
          event.dataTransfer.setData("task", JSON.stringify(this.props.task))
        }
      >
        <p>{this.props.task.name}</p>
        <CloseButton
          onClick={event =>
            this.closeTask(this.props.task.tabName, this.props.task._id, event)
          }
        >
          <i className="fa fa-times" />
        </CloseButton>
        <AssigneeIcon>
          {this.props.assignee ? this.shortenName(this.props.assignee) : "?"}
        </AssigneeIcon>
        <ApproverIcon>
          {this.props.approver ? this.shortenName(this.props.approver) : "?"}
        </ApproverIcon>
        <DueDateIcon status={task.status} dueDate={task.dueDate}>
          {moment(task.dueDate).format("YYYY/MM/DD")}
        </DueDateIcon>
        <TaskModifying
          ref="taskModifying"
          task={this.props.task}
          assignee={this.props.assignee}
          approver={this.props.approver}
          taskFolderId={this.props.taskFolderId}
          total={this.props.total}
        />
      </div>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
  approver: PropTypes.object,
  assignee: PropTypes.object,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired
};

export default Task;
