import React, { Component } from 'react';
import styled from 'styled-components';

class TasksView extends Component {
  constructor() {
    super();
  }

  render() {
    const ColumnWrapper = styled.div `
      background-color: #e2e4e6;
      padding: 10px;
      color: #4d4d4d;
      border-radius: 2px;
    `;
    const ColumnHeader = styled.div `
      font-weight: bold;
    `;
    const TaskContainer = styled.div `
      background-color: white;
      padding: 8px;
      border-radius: 2px;
      color: #4d4d4d;
      font-weight: 400;
      font-size: 13px;
      margin-bottom: 7px;
      &:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }
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
    const TaskAdding = styled.div `
      font-size: 13px;
      padding: 5px;
      &:hover {
        background-color: #CDD2D4;
        cursor: pointer;
      }
    `;
    const AssigneeIcon = styled.div `
      width: 25px;
      height: 20px;
      background-color: #ccc;
      text-align: center;
      font-weight: 400;
      border-radius: 3px;
    `;

    return (
      <div>
        <div className='col-md-12'>
          <ColumnWrapper className='col-md-2'>
            <ColumnHeader>
              Idea
              <TaskAction>
                <i className='fa fa-ellipsis-h'/>
              </TaskAction>
            </ColumnHeader>
            <div>
              <TaskContainer>
                <p>Move Task 33 to 44</p>
                <AssigneeIcon>
                  IF
                </AssigneeIcon>
              </TaskContainer>
              <TaskContainer>
                Move Task 33 to 44
              </TaskContainer>
            </div>
            <TaskAdding>
              + Add a task ...
            </TaskAdding>
          </ColumnWrapper>
        </div>
      </div>
    );
  }
}

export default TasksView;
