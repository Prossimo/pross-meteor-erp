import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import TaskDetail from "./TaskDetail";

class TaskAdding extends Component {
  constructor() {
    super();
    this.state = {
      showDetail: false
    };

    this.showDetail = this.showDetail.bind(this);
    this.hideDetail = this.hideDetail.bind(this);
  }

  showDetail() {
    this.setState({
      showDetail: true
    });
  }

  hideDetail() {
    this.setState({
      showDetail: false
    });
  }

  render() {
    const AddingTask = styled.div`
      font-size: 13px;
      padding: 5px;
      &:hover {
        background-color: #cdd2d4;
        cursor: pointer;
      }
    `;
    return (
      <AddingTask>
        <a
          href="#"
          style={{ display: "block" }}
          onClick={event => {
            event.preventDefault();
            this.showDetail();
          }}
        >
          + Add a task ...
        </a>
        <TaskDetail
          tabName={this.props.tabName}
          showDetail={this.showDetail}
          hideDetail={this.hideDetail}
          isShown={this.state.showDetail}
          status={this.props.status}
          isNew={true}
          taskFolderId={this.props.taskFolderId}
          total={this.props.total}
          //projectId={this.props.projectId}
        />
      </AddingTask>
    );
  }
}

TaskAdding.propTypes = {
  tabName: PropTypes.string,
  status: PropTypes.string.isRequired,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired
  //projectId: PropTypes.string
};

export default TaskAdding;
