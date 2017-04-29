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
      approverName: props.approver ? shortenName(props.approver) : '?',
    };

    this.showDetail = this.showDetail.bind(this);
  }

  showDetail() {
    this.refs.taskModifying.showDetail();
  }

  render() {
    const AssigneeIcon = styled.div `
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
    const ApproverIcon = styled.div `
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
    const DueDateIcon = styled(ApproverIcon) `
      float: left;
      width: 80px;
      background-color: ${this.props.task.dueDate.valueOf() >= Date.now() ? '#0079BF' : '#EB5A46'};
      color: white;
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
      display: inline-block;
      width: 100%;
      &:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }
    `;
    return (
      <TaskContainer
        onClick={ this.showDetail }
        draggable='true'
        onDragStart={ event =>
          event.dataTransfer.setData('task', JSON.stringify(this.props.task))
        }
      >
        <p>{ this.props.task.name }</p>
        <AssigneeIcon>
          { this.state.assigneeName }
        </AssigneeIcon>
        <ApproverIcon>
          { this.state.approverName }
        </ApproverIcon>
        <DueDateIcon>
          { moment(this.props.task.dueDate).format('YYYY/MM/DD') }
        </DueDateIcon>
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
  approver: PropTypes.object,
  assignee: PropTypes.object.isRequired,
};

export default Task;
