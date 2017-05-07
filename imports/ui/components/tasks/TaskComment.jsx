import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';

class TaskComment extends Component {
  constructor() {
    super();
  }

  render() {
    const CommentContainer = styled.div `
    `;
    const CommentIcon = styled.div `
      text-align: center;
      line-height: 30px;
      border-radius: 5px;
      background-color: #0079BF;
      font-size: 10px;
      color: white;
      margin-right: 10px;
      width: 30px;
      height: 30px;
      float: left;
    `;
    const CommentContent = styled.div `
      width: calc(100% - 100px);
      float: left;
    `;
    const TextArea = styled.textarea `
      font-size: 14px;
      width: calc(100% - 15px);
      min-height: 50px;
      border-image: none;
      border-radius: 6px 6px 6px 6px;
      border-style: none none none solid;
      border-width: medium 1px 1px medium;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) inset;
      color: #555555;
      font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
      font-size: 1em;
      line-height: 1.4em;
      padding: 5px 8px;
      transition: background-color 0.2s ease 0s;
      background: none repeat scroll 0 0 #FFFFFF;
      border-left-color: green;
      &:focus {
        background: none repeat scroll 0 0 rgba(0, 0, 0, 0.07);
        outline-width: 0;
      }
    `;
    return (
      <div>
        <p>
          <i className='fa fa-comment-o'/> Add Comment
        </p>
        <CommentContainer>
          <CommentIcon>
            DTN
          </CommentIcon>
          <CommentContent>
            <TextArea
              placeholder={'Write a comment ...'}
            />
            <button className='btn btn-default'>Send</button>
          </CommentContent>
        </CommentContainer>
      </div>
    );
  }
}

export default TaskComment;
