import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import TaskModifying from './TaskModifying.jsx';

class Task extends Component {
  constructor(props) {
    super(props);

    const shortenName = ({ profile: { firstName, lastName } })=> {
      return `${firstName} ${lastName}`
        .split(' ')
        .reduce((result, next)=> `${result}${next.charAt(0)}`, '');
    };

    this.state = {
      assigneeName: shortenName(props.assignee),
      approverName: shortenName(props.approver),
    };

    this.showDetail = this.showDetail.bind(this);
  }

  showDetail() {
    this.refs.taskModifying.showDetail();
  }

  render() {
    const AssigneeIcon = styled.div `
      width: 50px;
      height: 20px;
      background-color: #519839;
      text-align: center;
      font-weight: 400;
      border-radius: 3px;
      overflow-x: hidden;
      position: relative;
      float: left;
      margin-right: 2px;
      color: white;
    `;
    const ApproverIcon = styled.div `
      width: 50px;
      height: 20px;
      background-color: #ccc;
      text-align: center;
      font-weight: 400;
      border-radius: 3px;
      overflow-x: hidden;
      position: relative;
    `;
    const TaskContainer = styled.div `
      background-color: white;
      padding: 8px;
      border-radius: 2px;
      color: #4d4d4d;
      font-weight: 400;
      font-size: 13px;
      margin-bottom: 7px;
      position: relative;
      &:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }
    `;
    return (
      <TaskContainer
        onClick={ this.showDetail }
        draggable='true'
      >
        <p>{ this.props.task.name }</p>
        <AssigneeIcon>
          { this.state.assigneeName }
        </AssigneeIcon>
        <ApproverIcon>
          { this.state.approverName }
        </ApproverIcon>
        <TaskModifying
          ref='taskModifying'
          task={this.props.task}
          assignee={this.props.assignee}
          approver={this.props.approver}
        />
      </TaskContainer>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
  approver: PropTypes.object.isRequired,
  assignee: PropTypes.object.isRequired,
};

export default Task;
