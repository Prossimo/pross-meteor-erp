import React from 'react';
import Select from 'react-select';
import { USER_ROLE_LIST } from '/imports/api/constatnts/roles';

class CreateUser extends React.Component{
    constructor(props){
        super(props);

        this.roleList = USER_ROLE_LIST.map(role=>({label: role, value: role}));

        this.defaultState = {
            selectedRole: this.roleList[0],
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            validEmail: '',
            validUsername: ''
        };
        this.state = this.defaultState;
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
        const { validation } = this.state;
        if(value === ''){
            event.target.parentElement.classList.remove('active');
        }
    }

    submit(event){
        event.preventDefault();
        const { firstName, lastName, username, email, selectedRole } = this.state;
        const userData = {
            firstName,
            lastName,
            username,
            email,
            role: selectedRole.value
        };
        if(!username) return this.setState({validUsername: "Username is require"});
        if(!email) return this.setState({validEmail: "Email is require"});

        Meteor.call('adminCreateUser', userData, (err)=>{
            if(err) return this.setState({[err.error]: err.reason});
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
            <div className="create-user">
                <form onSubmit={this.submit.bind(this)}
                      className="create-user-form">
                    <div className="flex-input">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName"
                               type="text"
                               onFocus={focusInput.bind(this)}
                               onBlur={blurInput.bind(this)}
                               value={firstName}
                               onChange={changeInput.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName"
                               type="text"
                               onFocus={focusInput.bind(this)}
                               onBlur={blurInput.bind(this)}
                               value={lastName}
                               onChange={changeInput.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="username">Username</label>
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
                        <label htmlFor="email">Email</label>
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

                    <button className="btn login-btn" type="submit">Create new user</button>
                </form>
            </div>
        )
    }
}

export default  CreateUser;