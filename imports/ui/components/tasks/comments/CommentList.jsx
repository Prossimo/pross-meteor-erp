import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import moment from 'moment';
import swal from 'sweetalert2';
import Textcomplete from 'textcomplete/lib/textcomplete';
import Textarea from 'textcomplete/lib/textarea';
import 'sweetalert2/dist/sweetalert2.min.css';
import CommentIcon from './CommentIcon.jsx';

class CommentList extends Component {
  constructor() {
    super();
    this.state = {
      comments: {},
    };
    this.editComment = this.editComment.bind(this);
    this.removeComment = this.removeComment.bind(this);
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

  removeComment(_id, event) {
    event.preventDefault();
    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then(function () {
      Meteor.call('task.removeComment', { _id }, (error, result)=> {
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          swal('Delete task failed',  msg, 'warning');
        }
      });
      swal(
        'Removed!',
        'Your comment has been removed.',
        'success'
      );
    });
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

  componentDidMount() {
    //const editor = new Textarea(this.refs.comment);
    //const textComplete = new Textcomplete(editor);
    //textComplete.register([
      //{
        //match: /(^|\s)@(.*)$/,
        //search(term, callback) {
          //Meteor.call('task.findUsers', {
            //keyword: term,
            //ignore: '',
          //}, (error, users)=> {
            //if (!error) {
              //callback(
                //users.map(({ username })=> username)
              //);
            //}
          //});
        //},
        //replace(value) {
          //return `@${value}`;
        //},
      //},
    //]);
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
                          ref='comment'
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
                                <span>
                                  <a href='#' onClick={(event)=> this.editComment(_id, event)}>Edit</a> -
                                  <a href='#' onClick={(event)=> this.removeComment(_id, event)}> Remove </a> -&nbsp;
                                </span>
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
