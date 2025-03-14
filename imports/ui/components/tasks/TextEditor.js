import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

class TextEditor extends Component {
  changeContent = event => {
    const content = event.target.value;
    this.props.onChange(content);
  };

  render() {
    const TextArea = styled.textarea`
      font-size: 14px;
      margin-top: 15px;
      margin-left: 15px;
      width: 100%;
      min-height: 215px;
      border-image: none;
      border-radius: 6px 6px 6px 6px;
      border-style: none none none solid;
      border-width: medium 1px 1px medium;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) inset;
      color: #555555;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 1em;
      line-height: 1.4em;
      padding: 5px 8px;
      transition: background-color 0.2s ease 0s;
      background: none repeat scroll 0 0 #ffffff;
      border-left-color: green;
      resize: none;
      &:focus {
        outline-width: 0;
      }
    `;
    return (
      <TextArea
        placeholder="This task is about ..."
        defaultValue={this.props.content}
        onClick={event => {
          event.stopPropagation();
        }}
        onBlur={event => {
          this.changeContent(event);
        }}
      />
    );
  }
}

TextEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default TextEditor;
