import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import TaskDetail from './TaskDetail.jsx';

class TaskModifying extends Component {
  constructor() {
    super();
    this.state = {
      task: {
        showDetail: true,
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
    this.props.close();
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
  close: PropTypes.func.isRequired,
};

export default TaskModifying;
