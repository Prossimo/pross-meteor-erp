import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import CommentList from './comments/CommentList.jsx';
import CommentIcon from './comments/CommentIcon.jsx';

class TaskComment extends Component {
  constructor() {
    super();
  }

  render() {
    const CommentBox = styled.div `
      position: relative;
      display: inline-block;
      width: 100%;
    `;
    const CommentContent = styled.div `
      width: calc(100% - 45px);
      float: left;
    `;
    const TextArea = styled.textarea `
      width: 100%;
      min-height: 50px;
      border: 1px solid #CDD2D4;
      border-radius: 3px;
      font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
      padding: 5px 8px;
      color: #4d4d4d;
      resize: none;
      font-size: 14px;
      &:focus {
        background: none repeat scroll 0 0 rgba(0, 0, 0, 0.07);
        outline-width: 0;
      }
    `;
    const SendButon = styled.button `
      border-radius: 0px;
    `;
    const Separator = styled.p `

    `
    return (
      <div>
        <Separator>
          <strong><i className='fa fa-comment-o'/>&nbsp;&nbsp; Add Comment</strong>
        </Separator>
        <CommentBox>
          <CommentIcon name={'DTN'}/>
          <CommentContent>
            <TextArea
              placeholder={'Write a comment ...'}
            />
            <SendButon className='btn btn-default btn-sm'>Send</SendButon>
          </CommentContent>
        </CommentBox>
        <Separator>
          <strong><i className='fa fa-align-left'/>&nbsp;&nbsp; Activity</strong>
        </Separator>
        <CommentList/>
      </div>
    );
  }
}

export default TaskComment;
