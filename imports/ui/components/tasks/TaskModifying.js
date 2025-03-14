import React, { Component } from "react";
import PropTypes from "prop-types";
import TaskDetail from "./TaskDetail";
import store from "/imports/redux/store";
import { activeTask } from "/imports/redux/actions";

class TaskModifying extends Component {
  state = {
    showDetail: false
  };

  componentDidMount() {
    const { task } = this.props;
    const {
      projects: { activeTask }
    } = store.getState();
    if (task && task._id == activeTask) {
      this.showDetail();
    }
  }

  showDetail = () => {
    this.setState({
      showDetail: true
    });
  };

  hideDetail = () => {
    this.setState({
      showDetail: false
    });
    store.dispatch(activeTask(null));
  };

  render() {
    const task = _.clone(this.props.task);
    task.assignee = this.props.assignee;
    task.approver = this.props.approver;
    return (
      <TaskDetail
        showDetail={this.showDetail}
        hideDetail={this.hideDetail}
        isShown={this.state.showDetail}
        status={task.status}
        isNew={false}
        task={task}
        key={task._id}
        taskFolderId={this.props.taskFolderId}
        total={this.props.total}
        //projectId={this.props.projectId}
      />
    );
  }
}

TaskModifying.propTypes = {
  task: PropTypes.object.isRequired,
  assignee: PropTypes.array,
  approver: PropTypes.array,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired
  //projectId: PropTypes.string
};

export default TaskModifying;
