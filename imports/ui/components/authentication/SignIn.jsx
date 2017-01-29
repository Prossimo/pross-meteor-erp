import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Col, Form, FormGroup, ControlLabel} from 'react-bootstrap';

class SignIn extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: '',
            password: '',
            loginRequest: false,
            authError: ''
        }
    }

    submit(e){
        e.preventDefault();

        let username = this.state.username.trim(),
            password = this.state.password.trim();

        if (username && password) {
            this.setState({loginRequest: true});

            Meteor.loginWithPassword({username}, password, (err) => {
                if (err) {
                    this.setState({authError: "Invalid username or password"});
                }
                else {
                    FlowRouter.reload();
                }
            });
        }else{
            this.setState({authError: "Some field is empty"});
        }
    }

    focusInput(event){
        event.target.parentElement.classList.add('active');
        this.setState({authError: false});
    }

    blurInput(event){
        if(event.target.value === ''){
            event.target.parentElement.classList.remove('active');
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

    toggle(){
        if (typeof this.props.toggle === 'function') {
            this.props.toggle();
        }
    }

    render() {
        return (
            <div className="sign-in-wrap">
                <header className="auth-header">
                    <h2 className="title">Welcome to meteor chat</h2>
                </header>
                <form className="auth-form" onSubmit={this.submit.bind(this)}>
                    <div className="flex-input">
                        <label htmlFor="usern">Username</label>
                        <input id="username"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={this.state.username}
                               onChange={this.change.bind(this)}
                        />
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
                    </div>
                    <button className="btn login-btn" type="submit">Login</button>
                    {this.state.authError ? <span className="warn-msg">{this.state.authError}</span> : ''}
                </form>
                <footer className="auth-footer">
                    <button onClick={this.toggle.bind(this)}
                            className="toggle-auth">Create new account</button>
                </footer>
            </div>
        )
    }
}
export default SignIn;