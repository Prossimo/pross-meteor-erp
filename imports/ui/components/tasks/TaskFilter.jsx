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
    this.changeState = this.changeState.bind(this);
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  assignToMe(event) {
    const checked = event.target.checked;
    console.log(checked);
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
            defaultChecked={this.state.assignToMe}
            icons={false}
            onChange={this.assignToMe} />
          <span>Assign to me</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.assignToMe}
            icons={false}
            onChange={this.assignToMe} />
          <span>I am approver</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.assignToMe}
            icons={false}
            onChange={this.assignToMe} />
          <span>Due date Tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.assignToMe}
            icons={false}
            onChange={this.assignToMe} />
          <span>Today tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.assignToMe}
            icons={false}
            onChange={this.assignToMe} />
          <span>Tomorrow tasks</span>
        </ToggleButton>
      </div>
    );
  }
}

export default TaskFilter;
