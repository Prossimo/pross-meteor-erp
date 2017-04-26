import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';

class TaskName extends Component {
  constructor(props) {
    super();
    this.state = {
      editable: false,
      name: props.name,
    };
    this.changeState = this.changeState.bind(this);
    this.changeName = this.changeName.bind(this);
  }

  changeName(event) {
    const name = event.target.value;
    this.state.name = name;
    this.props.onChange(name);
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  render() {
    const HeaderContainer = styled.div `
      position: relative;
    `;
    const TitleContent = styled.div `
      position: relative;
      margin-left: 25px;
    `;
    const TitleIcon = styled.div `
      position: absolute;
      width: 30px;
    `;
    return (
      <HeaderContainer>
        <TitleIcon>
          <i className='fa fa-credit-card'/>
        </TitleIcon>
        <TitleContent onClick={() => this.changeState(this.state, 'editable', true)}>
          {
            (this.state.editable) ? (
              <input
                defaultValue={this.state.name}
                onChange={this.changeName}
                autoFocus={true}
                onBlur={()=> this.changeState(this.state, 'editable', false)}
              />
            ) : (
              <span> &nbsp; { this.state.name } </span>
            )
          }
        </TitleContent>
      </HeaderContainer>
    );
  }
}

TaskName.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TaskName;
