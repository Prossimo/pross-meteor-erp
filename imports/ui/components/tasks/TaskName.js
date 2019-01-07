import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

class TaskName extends Component {
  changeName = event => {
    const name = event.target.value;
    this.props.onChange(name);
  };

  render() {
    const HeaderContainer = styled.div`
      position: relative;
    `;
    const TitleContent = styled.div`
      position: relative;
      margin-left: 25px;
    `;
    const TitleIcon = styled.div`
      position: absolute;
      width: 30px;
    `;
    return (
      <HeaderContainer>
        <TitleIcon>
          <i className="fa fa-credit-card" />
        </TitleIcon>
        <TitleContent>
          <input
            defaultValue={this.props.name}
            onClick={event => {
              event.stopPropagation();
            }}
            onBlur={event => {
              this.changeName(event);
            }}
          />
        </TitleContent>
      </HeaderContainer>
    );
  }
}

TaskName.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired
};

export default TaskName;
