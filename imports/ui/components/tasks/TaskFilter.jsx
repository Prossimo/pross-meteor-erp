import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

class TaskFilter extends Component {
  constructor() {
    super();
    this.state = {
      assignToMe: false,
    };
    this.changeFilter = this.changeFilter.bind(this);
  }

  changeFilter(propName, propValue) {
    this.props.taskFilter.set(propName, propValue);
  }

  render() {
    const ToggleButton = styled.label `
      padding: 0 20px;
      .react-toggle-track {
        width: 30px;
        height: 18px;
      }
      .react-toggle-thumb {
        width: 15px;
        height: 15px;
      }
      .react-toggle--checked .react-toggle-thumb {
        left: 13px;
      }
      .react-toggle {
        top: 4px;
      }
      span {
        font-size: 14px;
        padding-left: 3px;
      }
    `;
    return (
      <div className='col-md-12' style={{textAlign: 'center'}}>
        <ToggleButton>
          <Toggle
            defaultChecked={this.props.taskFilter.get('AssignToMe')}
            icons={false}
            onChange={event => this.changeFilter('AssignToMe', event.target.checked)} />
          <span>Assign to me</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.props.taskFilter.get('IamApprover')}
            icons={false}
            onChange={event => this.changeFilter('IamApprover', event.target.checked)} />
          <span>I am approver</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.props.taskFilter.get('DueDate')}
            icons={false}
            onChange={event => this.changeFilter('DueDate', event.target.checked)} />
          <span>Due date Tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.props.taskFilter.get('Today')}
            icons={false}
            onChange={event => this.changeFilter('Today', event.target.checked)} />
          <span>Today tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.props.taskFilter.get('Tomorrow')}
            icons={false}
            onChange={event => this.changeFilter('Tomorrow', event.target.checked)} />
          <span>Tomorrow tasks</span>
        </ToggleButton>
      </div>
    );
  }
}

export default TaskFilter;
