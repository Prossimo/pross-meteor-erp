import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import TaskDetail from './TaskDetail.jsx';

class TaskModifying extends Component {
  constructor() {
    super();
    this.state = {
      task: {
        showDetail: false,
      },
    };

    this.showDetail = this.showDetail.bind(this);
    this.hideDetail = this.hideDetail.bind(this);
  }

  showDetail() {
    this.setState({
      task: {
        showDetail: true,
      },
    });
  }

  hideDetail() {
    this.setState({
      task: {
        showDetail: false,
      },
    });
  }

  render() {
    return (
      <TaskDetail
        showDetail={this.showDetail}
        hideDetail={this.hideDetail}
        isShown={this.state.task.showDetail}
        status={''}
        isNew={false}
      />
    );
  }
}

TaskModifying.propTypes = {
  task: PropTypes.object.isRequired,
  assignee: PropTypes.object.isRequired,
  approver: PropTypes.object.isRequired,
};

export default TaskModifying;
