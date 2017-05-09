import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import moment from 'moment';
import CommentIcon from './CommentIcon.jsx';

class CommentList extends Component {
  constructor() {
    super();
  }

  shortenName({ profile: { firstName, lastName } }) {
    return `${firstName} ${lastName}`
      .split(' ')
      .reduce((result, next)=> `${result}${next.charAt(0)}`, '');
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
      white-space: pre;
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
        {
          _.sortBy(this.props.comments, ({ createdAt })=> -createdAt.getTime())
          .map(({ content, createdAt, user })=> {
            let username = user ? user.username : 'loading ...';
            let shortName = user ? this.shortenName(user) : 'loading ...';
            return (
              <div key={createdAt}>
                <CommentIcon name={shortName}/>
                <CommentBox>
                  <CommentTitle>
                    {username}
                  </CommentTitle>
                  <CommentContent>
                    { content }
                  </CommentContent>
                  <CommentControls>
                    <p className='pull-right'>
                      <small>{ moment(createdAt).format('YYYY MMM D hh:mm:ss A') }</small> - <a href='#'>Reply</a>
                    </p>
                  </CommentControls>
                </CommentBox>
              </div>
            );
          })
        }
      </div>
    )
  }
}

CommentList.propTypes = {
  comments: PropTypes.array.isRequired,
}

export default createContainer(({ comments })=> {
  return {
    comments: comments.map(({ content, createdAt, userId })=> {
      return {
        content,
        createdAt,
        user: Meteor.users.find(userId).fetch()[0],
      };
    })
  }
}, CommentList);
