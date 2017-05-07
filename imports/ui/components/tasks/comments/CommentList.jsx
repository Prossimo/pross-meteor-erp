import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import CommentIcon from './CommentIcon.jsx';

class CommentList extends Component {
  constructor() {
    super();
  }

  render() {
    const CommentBox = styled.div `
      width: calc(100% - 45px);
      float: left;
    `;
    const CommentContent = styled.div `
      padding: 9px 11px;
      background-color: white;
      border-radius: 3px;
      font-size: 14px;
      color: #4d4d4d;
      margin-top: 5px;
    `;
    const CommentTitle = styled.div `
      font-size: 14px;
      margin: 0px;
      padding: 0px;
      font-weight: bold
    `;
    const CommentControls = styled.div `
      width: 100%;
      border-bottom: 1px solid white;
      display: inline-block;
      color: #8c8c8c;
      small {
        font-size: 11px;
        color: #8c8c8c;
      }
      a {
        font-size: 12px;
        color: #8c8c8c;
      }
      p {
        padding: 0px;
        margin: 0px;
      }
    `;

    return (
      <div>
        <div>
          <CommentIcon name={'RA'}/>
          <CommentBox>
            <CommentTitle>
              Duy Tai Nguyen
            </CommentTitle>
            <CommentContent>
              For security purposes all actions that merchants use are based on this ID and we must verify that we have the correct user using his ID in such actions (this happens in later stages).
            </CommentContent>
            <CommentControls>
              <p className='pull-right'>
                <small>Apr 3 at 8:25 PM</small> - <a href='#'>Reply</a>
              </p>
            </CommentControls>
          </CommentBox>
        </div>
        <div>
          <CommentIcon name={'RA'}/>
          <CommentBox>
            <CommentTitle>
              Duy Tai Nguyen
            </CommentTitle>
            <CommentContent>
              For security purposes all actions that merchants use are based on this ID and we must verify that we have the correct user using his ID in such actions (this happens in later stages).
            </CommentContent>
            <CommentControls>
              <p className='pull-right'>
                <small>Apr 3 at 8:25 PM</small> - <a href='#'>Reply</a>
              </p>
            </CommentControls>
          </CommentBox>
        </div>
      </div>
    )
  }
}

export default CommentList;
