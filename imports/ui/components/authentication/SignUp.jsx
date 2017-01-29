import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';


class SignUp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isLogining: false,
            validation: {
                email: '',
                password: '',
                username: ''
            },
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            repeatPassword: '',
            username: ''
        }
    }

    toggle(){
        if (typeof this.props.toggle === 'function') {
            this.props.toggle();
        }
    }

    submit(event){
        event.preventDefault();
        const { username, password, email, repeatPassword} = this.state;
        let validation = {};

        if(username == ''){
            validation.username = "Field is require"
        } else if(username.length < 3) {
            validation.username = "User name must be longer";
        }
        if(email == '') {
            validation.email = "Field is require";
        } else if(email.indexOf("@") == -1) {
            validation.email = "Invalid email";
        }
        if(password == '') {
            validation.password = "Field is require";
        } else if(password && password !== repeatPassword) {
            validation.password = "Password is wrong!";
        }

        if(JSON.stringify(validation) !== '{}'){
            this.setState({validation: Object.assign(this.state.validation, validation)});
        }else{
            this.setState({isLogining: true});
            Meteor.call("userRegistration", this.state, (err,res)=>{
                this.setState({isLogining: false});
                if(!err){
                    const { username, password, validation } = res;
                    if(validation.email || validation.username){
                        this.setState({validation: Object.assign(this.state.validation, validation)});
                    }else{
                        Meteor.loginWithPassword({username}, password, (err) => {
                            FlowRouter.reload();
                        });
                    }
                }
            })
        }
    }

    focusInput(event){
        const { validation } = this.state;
        event.target.parentElement.classList.add('active');
        if(validation[event.target.id]){
            this.setState({validation: Object.assign(validation, {[event.target.id]: ''})});
        }
    }

    blurInput(event){
        const value = event.target.value;
        const { validation } = this.state;
        if(value === ''){
            event.target.parentElement.classList.remove('active');
        }
        switch (event.target.id){
            case 'email':
                if(value.indexOf("@") == -1)
                    this.setState({validation: Object.assign(validation, {email: "Email must exist @"})});
                break;
            case 'username':
                if(value === '')
                    this.setState({validation: Object.assign(validation, {username: "User name is require"})});
                break;
            case 'repeatPassword':
                if(value !== this.state.password)
                    this.setState({validation:  Object.assign(validation, {password: "Password is wrong"})});
                break;
            default:
                return true;
        }
    }

    change(event){
        this.setState({
            [event.target.id]: event.target.value
        });
        if(event.target.value !== ''){
            event.target.parentElement.classList.add('active')
        }
    }

    render() {
        let {validation} = this.state;
        return (
            <div className="sign-up-wrap">
                <header className="auth-header">
                    <h2 className="title">Create new account</h2>
                </header>
                <form className="auth-form" onSubmit={this.submit.bind(this)}>
                    <div className="flex-input">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.firstName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.lastName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="username">Username</label>
                        <input id="username"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.username}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.username}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                               type="email"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.email}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.email}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="password">Password</label>
                        <input id="password"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.password}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.password}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="repeatPassword">Repeat password</label>
                        <input id="repeatPassword"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.repeatPassword}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <button className="btn login-btn" type="submit">Registrate</button>
                </form>
                <footer className="auth-footer">
                    <button onClick={this.toggle.bind(this)}
                            className="toggle-auth">I have account</button>
                </footer>
            </div>
        )
    }
}
export default SignUp;