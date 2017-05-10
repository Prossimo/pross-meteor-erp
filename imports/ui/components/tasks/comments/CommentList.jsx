import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import moment from 'moment';
import CommentIcon from './CommentIcon.jsx';

class CommentList extends Component {
  constructor() {
    super();
    this.state = {
      comments: {},
    };
    this.editComment = this.editComment.bind(this);
    this.changeState = this.changeState.bind(this);
    this.updateComment = this.updateComment.bind(this);
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  shortenName({ profile: { firstName, lastName } }) {
    return `${firstName} ${lastName}`
      .split(' ')
      .reduce((result, next)=> `${result}${next.charAt(0)}`, '');
  }

  updateComment(_id, event) {
    const content = event.target.value;
    Meteor.call('task.updateComment', { _id, content }, () => {
      this.setState({ comments: {} });
    });
  }

  editComment(_id, event) {
    event.preventDefault();
    this.changeState(this.state.comments, _id, true);
  }

  render() {
    return (
      <div>
        {
          _.sortBy(this.props.comments, ({ createdAt })=> -createdAt.getTime())
          .map(({ content, createdAt, user, _id })=> {
            let username = user ? user.username : 'loading ...';
            let shortName = user ? this.shortenName(user) : 'loading ...';
            return (
              <div key={_id}>
                <CommentIcon name={shortName}/>
                <div className='comment-box'>
                  <div className='comment-title'>
                    {username}
                  </div>
                  {
                    (this.state.comments[_id]) ? (
                      <div>
                        <textarea
                          className='edit-comment-editor'
                          autoFocus={true}
                          onBlur={(event) => this.updateComment(_id, event)}
                        >
                        { content }
                        </textarea>
                      </div>
                    ) : (
                      <div>
                        <div className='comment-content'>
                          { content }
                        </div>
                        <div className='comment-controls'>
                          <p className='pull-right'>
                            <small>{ moment(createdAt).format('YYYY MMM D hh:mm:ss A') }</small> -&nbsp;
                            {
                              (user._id === Meteor.userId()) ? (
                                <span><a href='#' onClick={(event)=> this.editComment(_id, event)}>Edit</a> - </span>
                              ) : ''
                            }
                            <a href='#'>Reply</a>
                          </p>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.array.isRequired,
};

export default createContainer(({ comments })=> {
  return {
    comments: comments.map(({ content, createdAt, userId, _id })=> {
      return {
        content,
        createdAt,
        user: Meteor.users.find(userId).fetch()[0],
        _id,
      };
    }),
  };
}, CommentList);
