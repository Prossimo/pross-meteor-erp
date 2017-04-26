import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import Task from './Task.jsx';
import TaskAdding from './TaskAdding.jsx';
import TaskModifying from './TaskModifying.jsx';

class TaskList extends Component {
  constructor() {
    super();
    this.state = {
      modifyingTask: null,
    };
    this.modifyTask = this.modifyTask.bind(this);
  }

  modifyTask(task, assignee, approver) {
    thise.setState({
      modifyTask: {
        task,
        assignee,
        approver,
      },
    });
  }

  render() {
    const ColumnContainer = styled.div `
      padding-left: 15px;
      padding-right: 0px;
    `;
    const ColumnWrapper = styled.div `
      background-color: #e2e4e6;
      padding: 10px;
      color: #4d4d4d;
      border-radius: 2px;
    `;
    const ColumnHeader = styled.div `
      font-weight: 500;
    `;
    const TaskAction = styled.div `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      text-align: center;
      color: #999;
      &:hover {
        background-color: #CDD2D4;
        border-radius: 3px;
        cursor: pointer;
      }
    `;
    return (
      <ColumnContainer className='col-md-2'>
        <ColumnWrapper>
          <ColumnHeader>
            { this.props.listName }
            <TaskAction>
              <i className='fa fa-ellipsis-h'/>
            </TaskAction>
          </ColumnHeader>
          <div>
            {
              this.props.tasks.map((task)=> {
                const assignee = this.props.users.find(({ _id }) => task.assignee);
                const approver = this.props.users.find(({ _id }) => task.approver);
                return <Task
                  key={task._id}
                  task={task}
                  assignee={assignee}
                  approver={approver}
                  onClick={()=> this.modifyTask(task, assignee, approver)}
                />;
              })
            }
          </div>
          {
            (this.state.modifyingTask) ? <TaskModifying
              task={ this.state.modifyingTask }
              close={ ()=> this.setState({ modifyingTask: null }) }
            /> : ''
          }
          <TaskAdding status={this.props.listName}/>
        </ColumnWrapper>
      </ColumnContainer>
    );
  }
}

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  listName: PropTypes.string.isRequired,
};

export default TaskList;

