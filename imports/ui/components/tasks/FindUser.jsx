import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';

class FindUser extends Component {
  constructor() {
    super();
    this.changeState = this.changeState.bind(this);
    this.changeKeyword = this.changeKeyword.bind(this);
    this.selectUser = this.selectUser.bind(this);
    this.state = {
      users: [],
      keyword: '',
    };
  }

  changeKeyword(keyword) {
    const ignore = this.props.ignore ? this.props.ignore._id : '';
    meteor.call('task.findusers', { keyword, ignore }, (error, users)=> {
      if (!error) this.setstate({ users, keyword });
    });
  }

  componentDidMount() {
    this.changeKeyword('');
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  selectUser(user) {
    this.props.selectUser(user);
    this.props.close();
  }

  render() {
    return (
      <div className='find-user-wrapper' style={{ top: `${this.props.top}px` }}>
        <a
          onClick={ this.props.close }
          className='pull-right find-user-close-button'
          href='#'>
          <i className='fa fa-times'/>
        </a>
        <p className='text-center'>{ this.props.title }</p>
        <div>
          <div className='form-group'>
            <input
              type='text'
              className='form-control input-sm'
              placeholder={`Search ${this.props.title}s`}
              value={ this.state.keyword }
              onChange={ (event) => this.changeKeyword(event.target.value) }
              autoFocus={true}
            />
          </div>
          <div className='form-group'>
          {
            this.state.users.map((user)=> {
              const { username, emails, _id } = user;
              const email = _.first(emails) ? `(${_.first(emails).address})` : ``;
              return (
                <div
                  className='assignee-elem'
                  key={ _id }
                  onClick={ ()=> this.selectUser(user) }>
                  { username } { email }
                </div>
              );
            })
          }
          </div>
        </div>
      </div>
    );
  };
}

FindUser.propTypes = {
  close: PropTypes.func.isRequired,
  selectUser: PropTypes.func.isRequired,
  top: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ignore: PropTypes.object,
};

export default FindUser;
