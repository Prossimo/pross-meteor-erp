import React from "react";
import PropTypes from "prop-types";

export default class CustomToggle extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick = e => {
    e.preventDefault();

    this.props.onClick(e);
  };
  render() {
    return (
      <div style={{ cursor: "pointer" }} onClick={this.handleClick}>
        {this.props.children}
      </div>
    );
  }
}
