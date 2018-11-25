import React, { Component } from "react";
import { FormControl } from "react-bootstrap";

export default class InputField extends Component {
  render() {
    const { record, colDetails, handleChange } = this.props;
    const value = record[colDetails.key];
    return (
      <FormControl
        type="text"
        defaultValue={value}
        onChange={event => handleChange(event.target.value)}
      />
    );
  }
}
