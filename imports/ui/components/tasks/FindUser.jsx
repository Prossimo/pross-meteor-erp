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

  changeKeyword(event) {
    const keyword = event.target.value;
    const ignore = this.props.ignore ? this.props.ignore._id : '';
    Meteor.call('task.findUsers', { keyword, ignore }, (error, users)=> {
      if (!error) this.setState({ users, keyword });
    });
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
    const FindUserWrapper = styled.div `
      z-index: 1;
      width: 240px;
      min-height: 150px;
      background-color: white;
      position: fixed;
      padding: 5px;
      font-size: 13px;
      top: ${this.props.top};
      box-shadow: 0 1px 6px rgba(0,0,0,.15);
    `;
    const Header = styled.p `
      font-weight: 600;
      border-bottom: 1px solid lightgrey;
    `;
    const CloseButton = styled.a `
      color: black;
    `;
    const AssigneeElem = styled.div `
      background-color: #298FCA;
      padding: 3px;
      border-radius: 3px;
      color: white;
      cursor: pointer;
      margin-bottom: 3px;
    `;
    return (
      <FindUserWrapper>
        <CloseButton
          onClick={ this.props.close }
          className='pull-right'
          href='#'>
          <i className='fa fa-times'/>
        </CloseButton>
        <Header className='text-center'>{ this.props.title }</Header>
        <div>
          <div className='form-group'>
            <input
              type='text'
              className='form-control input-sm'
              placeholder='Search Assignees'
              value={ this.state.keyword }
              onChange={ this.changeKeyword }
              autoFocus={true}
            />
          </div>
          <div className='form-group'>
          {
            this.state.users.map((user)=> {
              const { username, emails, _id } = user;
              const email = _.first(emails) ? `(${_.first(emails).address})` : ``;
              return (
                <AssigneeElem
                  key={ _id }
                  onClick={ ()=> this.selectUser(user) }>
                  { username } { email }
                </AssigneeElem>
              );
            })
          }
          </div>
        </div>
      </FindUserWrapper>
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
