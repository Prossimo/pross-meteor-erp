import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { info } from '/imports/api/lib/alerts';
import { isValidEmail } from '/imports/api/lib/validation';
import { USER_ROLE_LIST } from '/imports/api/constants/roles';

class EditUser extends React.Component{
  constructor(props){
    super(props);
  
    this.roleList = USER_ROLE_LIST.map(role=>({label: role, value: role}));
    
    this.defaultState = {
      _id: props.user._id,
      selectedRole: props.user.role,
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      username: props.user.username,
      email: props.user.email,
      validEmail: '',
      validUsername: '',
      showModal: false,
      newEmail: false,
      newUsername: false
    };
    
    this.state = this.defaultState;
    
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }
  
  componentWillReceiveProps (nextProps) {
    this.setState({
      _id: nextProps.user._id,
      selectedRole: nextProps.user.role,
      firstName: nextProps.user.firstName,
      lastName: nextProps.user.lastName,
      username: nextProps.user.username,
      email: nextProps.user.email,
    });
  }
  
  close() {
    this.setState({ showModal: false });
  }
  
  open() {
    this.setState({ showModal: true });
  }
  
  changeRole(selectedRole){
    this.setState({selectedRole})
  }
  
  focusInput(event){
    event.target.parentElement.classList.add('active');
    this.setState({validEmail: '', validUsername: ''})
  }
  
  blurInput(event){
    const value = event.target.value;
    if(value === ''){
      event.target.parentElement.classList.remove('active');
    }
  }
  
  submit(event){
    event.preventDefault();
    
    const unicFields = {
      newUsername: false,
      newEmail: false,
    };
    
    const { _id, firstName, lastName, username, email, selectedRole } = this.state;
  
    if (username !== this.props.user.username) {
      unicFields.newUsername = true;
    }
    if (email !== this.props.user.email) {
      unicFields.newEmail = true;
    }
    
    const userData = {
      _id,
      firstName,
      lastName,
      username,
      email,
      role: selectedRole.value
    };
    
    if(!username) return this.setState({validUsername: "Username is require"});
    if(!isValidEmail(email)) return this.setState({validEmail: "Email is require"});
  
    console.log(userData);
    console.log(unicFields);
    
    Meteor.call('adminEditUser', userData, unicFields, (err)=>{
      if(err) return this.setState({[err.error]: err.reason});
      info('User was successfully edited!');
      this.setState(this.defaultState);
    })
  }
  
  changeInput(event){
    this.setState({
      [event.target.id]: event.target.value
    });
    if(event.target.value !== ''){
      event.target.parentElement.classList.add('active')
    }
  }
  
  render() {
    const { roleList, changeRole, blurInput, focusInput, changeInput  } = this;
    const { selectedRole, firstName, lastName, username, email, validEmail, validUsername } = this.state;
    
    return (
      <div>
        <Button bsStyle="primary" onClick={this.open}>Edit</Button>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Edit user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.submit.bind(this)}
                  className="create-user-form">
              <div className="flex-input">
                <label htmlFor="firstName">{firstName ? '' : 'First name'}</label>
                <input id="firstName"
                       type="text"
                       onFocus={focusInput.bind(this)}
                       onBlur={blurInput.bind(this)}
                       value={firstName}
                       onChange={changeInput.bind(this)}
                />
              </div>
              <div className="flex-input">
                <label htmlFor="lastName">{lastName ? '' : 'Last name'}</label>
                <input id="lastName"
                       type="text"
                       onFocus={focusInput.bind(this)}
                       onBlur={blurInput.bind(this)}
                       value={lastName}
                       onChange={changeInput.bind(this)}
                />
              </div>
              <div className="flex-input">
                <label htmlFor="username">{username ? '' : 'Username'}</label>
                <input id="username"
                       type="text"
                       onFocus={focusInput.bind(this)}
                       onBlur={blurInput.bind(this)}
                       value={username}
                       onChange={changeInput.bind(this)}
                />
                <span className="validation">{validUsername}</span>
              </div>
              <div className="flex-input">
                <label htmlFor="email">{email ? '' : 'Email'}</label>
                <input id="email"
                       type="email"
                       onFocus={focusInput.bind(this)}
                       onBlur={blurInput.bind(this)}
                       value={email}
                       onChange={changeInput.bind(this)}
                />
                <span className="validation">{validEmail}</span>
              </div>
              <Select
                value={selectedRole}
                onChange={changeRole.bind(this)}
                options={roleList}
                className={"select-role"}
                clearable={false}
              />
    
              <button className="btnn login-btn" type="submit">Edit</button>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default  EditUser;