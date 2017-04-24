import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';

class Task extends Component {
  constructor() {
    super();
    this.state = {
      assigneeName: '',
      approverName: '',
    };
  }

  componentDidMount() {
    const { assignee, approver } = this.props.task;
    const shortenName = ({ profile: { firstName, lastName } })=> {
      return `${firstName} ${lastName}`
        .split(' ')
        .reduce((result, next)=> `${result}${next.charAt(0)}`, '');
    };

    Meteor.call('task.getEmployee', { employeeId: assignee }, (error, user)=> {
      this.setState({
        assigneeName: shortenName(user),
      });
    });
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
      <TaskContainer draggable='true'>
        <p>{ this.props.task.name }</p>
        <AssigneeIcon>
          { this.state.assigneeName }
        </AssigneeIcon>
        <ApproverIcon>
          NCH
        </ApproverIcon>
      </TaskContainer>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
};

export default Task;
