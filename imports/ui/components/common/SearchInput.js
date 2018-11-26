import React from "react";
import PropTypes from "prop-types";
import { InputGroup, FormControl } from "react-bootstrap";

export default class SearchInput extends React.Component {
  onChangeInput = e => {
    if (this.props.onChange) this.props.onChange(e.target.value);
    return true;
  };

  render() {
    const { value } = this.props;
    return (
      <InputGroup>
        <InputGroup.Addon>
          <i className="fa fa-search" />
        </InputGroup.Addon>
        <FormControl
          type="text"
          defaultValue={value}
          placeholder="Search..."
          onChange={this.onChangeInput}
        />
      </InputGroup>
    );
  }
}
