import React, { Component } from "react";
import PropTypes from "prop-types";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";
import Select from "react-select";
import SelectUser from "./SelectUser";
import TextEditor from "./TextEditor";
import TaskName from "./TaskName";
import TaskError from "./TaskError";
import TaskComment from "./TaskComment";
import UploadFrom from "./upload/UploadFrom";
import UploadOverlay from "./upload/UploadOverlay";
import Attachments from "./upload/Attachments";
import { TaskStatus } from "/imports/api/models/tasks/tasks";

class TaskModal extends Component {
  state = {
    isFinding: {
      assignee: false,
      approver: false
    },
    errors: [],
    isAttach: false,
    task: Object.assign(
      {
        tabName: "",
        name: "",
        assignee: null,
        approver: null,
        dueDate: new Date(),
        description: "",
        status: TaskStatus[0],
        parentId: null,
        parentType: null
      },
      this.props.task || {}
    )
  };

  assignToMe = () => {
    const _id = this.props.task._id;
    const tabName = this.props.task.tabName;
    Meteor.call("task.assignToMe", { tabName, _id });
  };

  saveTask = () => {
    const {
      tabName,
      name,
      assignee,
      approver,
      dueDate,
      description,
      status,
      parentId,
      parentType
    } = this.state.task;
    const task = {
      tabName,
      name,
      assignee: assignee ? assignee._id : "",
      approver: approver ? approver._id : "",
      description,
      dueDate: moment(
        `${moment(dueDate).format("YYYY-MM-DD")} 23:59:59`
      ).toDate(),
      status,
      parentId,
      parentType
    };

    if (!this.props.task || !this.props.task._id) {
      Meteor.call("task.create", task, error => {
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          this.setState({ errors: [msg] });
        } else {
          this.props.onSaved();
          this.setState({ errors: [] });
        }
      });
    } else {
      task._id = this.props.task._id;
      Meteor.call("task.update", task, error => {
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          this.setState({ errors: [msg] });
        } else {
          this.props.onSaved();
          this.setState({ errors: [] });
        }
      });
    }
  };

  changeState = (prop, propName, propValue) => {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  };

  render() {
    !this.props.isNew && (this.state.task = this.props.task);
    const selectUsers = [
      {
        name: "assignee",
        top: 50,
        ignore: "approver",
        label: "Assignee"
      },
      {
        name: "approver",
        top: 50,
        ignore: "assignee",
        label: "Approver"
      }
    ];
    let hasAssignToMe = false;
    if (this.props.task && !this.props.isNew) {
      hasAssignToMe =
        !this.props.task.assignee ||
        (this.props.task.assignee &&
          this.props.task.assignee._id &&
          this.props.task.assignee._id !== Meteor.userId());
    }

    const { isOpen, onClose } = this.props;
    return (
      <Modal dialogClassName="task-details" show={isOpen} onHide={onClose}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-9">
              <div className="flex">
                <div>
                  <TaskName
                    name={this.state.task.name}
                    isNew={!this.props.task || !this.props.task._id}
                    onChange={name => {
                      this.state.task.name = name;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    options={TaskStatus.map(status => ({
                      value: status,
                      label: status
                    }))}
                    value={this.state.task.status}
                    onChange={item =>
                      this.changeState(this.state.task, "status", item.value)
                    }
                  />
                </div>
              </div>
              <TextEditor
                content={this.state.task.description}
                onChange={description => {
                  this.state.task.description = description;
                }}
              />
            </div>

            <div className="col-md-3">
              {selectUsers.map(({ name, top, label, ignore }) => (
                <SelectUser
                  key={name}
                  isFinding={this.state.isFinding[name]}
                  closeFinding={() =>
                    this.changeState(this.state.isFinding, name, false)
                  }
                  ignoreUser={this.state.task[ignore]}
                  title={label}
                  top={top}
                  user={this.state.task[name]}
                  onSelectUser={user =>
                    this.changeState(this.state.task, name, user)
                  }
                  removeUser={() =>
                    this.changeState(this.state.task, name, null)
                  }
                  toggleFinding={() =>
                    this.changeState(
                      this.state.isFinding,
                      name,
                      !this.state.isFinding[name]
                    )
                  }
                />
              ))}
              <div className="form-group">
                <label style={{ fontSize: "14px" }}>Due Date</label>
                <div className="form-control">
                  <DatePicker
                    selected={moment(this.state.task.dueDate)}
                    minDate={moment()}
                    onChange={date =>
                      this.changeState(
                        this.state.task,
                        "dueDate",
                        date.toDate()
                      )
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                {this.props.task && this.props.task._id ? (
                  <button
                    className="btn btn-default full-width hide"
                    onClick={() =>
                      this.changeState(
                        this.state,
                        "isAttach",
                        !this.state.isAttach
                      )
                    }
                  >
                    <i className="fa fa-paperclip" />
                    <small> Attachment</small>
                  </button>
                ) : (
                  ""
                )}
                {this.state.isAttach ? (
                  <UploadFrom
                    taskFolderId={this.props.taskFolderId}
                    taskId={this.props.task._id}
                    close={() =>
                      this.changeState(this.state, "isAttach", false)
                    }
                    className="hide"
                  />
                ) : (
                  ""
                )}
              </div>
              {hasAssignToMe ? (
                <div className="form-group">
                  <button
                    className="btn btn-warning full-width"
                    onClick={this.assignToMe}
                  >
                    Assign to me
                  </button>
                </div>
              ) : (
                ""
              )}
              <div className="form-group">
                <button
                  className="btn btn-primary full-width"
                  onClick={this.saveTask}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="col-md-12">
              <TaskError errors={this.state.errors} />
            </div>
            <div className="col-md-12">
              {this.props.task && this.props.task._id ? (
                <Attachments
                  attachments={this.props.task.attachments || []}
                  taskId={this.props.task._id}
                />
              ) : (
                ""
              )}
            </div>
            <div className="col-md-12">
              {this.props.task && this.props.task._id ? (
                <TaskComment task={this.props.task} />
              ) : (
                ""
              )}
            </div>
          </div>
          {this.props.task && this.props.task._id ? (
            <UploadOverlay
              taskFolderId={this.props.taskFolderId}
              taskId={this.props.task._id}
            />
          ) : (
            ""
          )}
        </Modal.Body>
      </Modal>
    );
  }
}

TaskModal.propTypes = {
  onSaved: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  task: PropTypes.object,
  taskFolderId: PropTypes.string
};

export default TaskModal;
