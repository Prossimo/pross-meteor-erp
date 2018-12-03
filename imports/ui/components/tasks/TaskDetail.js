import React, { Component } from "react";
import PropTypes from "prop-types";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";
import SelectUser from "./SelectUser";
import TextEditor from "./TextEditor";
import TaskName from "./TaskName";
import TaskError from "./TaskError";
import TaskComment from "./TaskComment";
import UploadFrom from "./upload/UploadFrom";
import UploadOverlay from "./upload/UploadOverlay";
import Attachments from "./upload/Attachments";

class TaskDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFinding: {
        assignee: false,
        approver: false
      },
      errors: [],
      isAttach: false,
      task: (!props.isNew && props.task) || {
        tabName: `${this.props.tabName}`,
        name: `${this.props.tabName.slice(0, -1)} #${props.total + 1}`,
        assignee: null,
        approver: null,
        dueDate: new Date(),
        description: "",
        status: props.status
      }
    };

    this.changeState = this.changeState.bind(this);
    this.saveTask = this.saveTask.bind(this);
    this.assignToMe = this.assignToMe.bind(this);
  }

  assignToMe() {
    const _id = this.props.task._id;
    const tabName = this.props.task.tabName;
    Meteor.call("task.assignToMe", { tabName, _id });
  }

  saveTask() {
    const parentId = FlowRouter.current().params.id;
    const parentType = FlowRouter.current().route.name.toLowerCase();
    const {
      tabName,
      name,
      assignee,
      approver,
      dueDate,
      description,
      status
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

    if (this.props.isNew) {
      Meteor.call("task.create", task, error => {
        console.log("task===", task);
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          this.setState({ errors: [msg] });
        } else {
          this.props.hideDetail();
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
          this.props.hideDetail();
          this.setState({ errors: [] });
        }
      });
    }
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  render() {
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
    return (
      <Modal
        dialogClassName="task-details"
        show={this.props.isShown}
        onHide={this.props.hideDetail}
      >
        <Modal.Body>
          <div className="row">
            <div className="col-md-9">
              <TaskName
                name={this.state.task.name}
                isNew={this.props.isNew}
                onChange={name => {
                  this.state.task.name = name;
                }}
              />
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
                {!this.props.isNew ? (
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
              {!this.props.isNew ? (
                <Attachments
                  attachments={this.props.task.attachments || []}
                  taskId={this.props.task._id}
                />
              ) : (
                ""
              )}
            </div>
            <div className="col-md-12">
              {!this.props.isNew ? <TaskComment task={this.props.task} /> : ""}
            </div>
          </div>
          {!this.props.isNew ? (
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

TaskDetail.propTypes = {
  showDetail: PropTypes.func.isRequired,
  hideDetail: PropTypes.func.isRequired,
  isShown: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  isNew: PropTypes.bool.isRequired,
  task: PropTypes.object,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired
};

export default TaskDetail;
