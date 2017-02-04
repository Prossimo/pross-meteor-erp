import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

class SignIn extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            email: '',
            password: '',
            passwordRepeat: '',
            validationPassword: '',
            authError: '',
            checkCreateAccount: false,
            isUserCreated: false,
        }
    }

    submit(e){
        const { checkCreateAccount, isUserCreated } = this.state;
        e.preventDefault();
        const email = this.state.email.trim(),
            password = this.state.password.trim(),
            passwordRepeat = this.state.passwordRepeat.trim();
        if(!email || !password || !checkCreateAccount) return this.setState({authError: "Some field is empty"});

        if (isUserCreated && password === passwordRepeat) {
            Meteor.call("initCreatedUser", email, password, (err, res)=>{
                if(err) return console.log(err);
                Meteor.loginWithPassword({email}, password, (err) => {
                    FlowRouter.reload();
                });
            })
        }
        else{
            Meteor.loginWithPassword({email}, password, (err) => {
                if (err) return this.setState({authError: "Invalid username or password"});

                FlowRouter.reload();
            });
        }
    }

    focusInput(event){
        event.target.parentElement.classList.add('active');
        this.setState({authError: false, validationPassword: false});
    }

    blurInput(event){
        const { isUserCreated, password, passwordRepeat } = this.state;
        if(event.target.value === ''){
            event.target.parentElement.classList.remove('active');
        }
        if(event.target.id === 'email'){
            Meteor.call("checkCreatedAccount", event.target.value, (err,res)=>{
                if(err) return;
                this.setState({checkCreateAccount: true, isUserCreated: res});
            })
        }
        if(isUserCreated && password && passwordRepeat){
            if(password !== passwordRepeat)
                this.setState({validationPassword: "Password is wrong"});
        }
    }

    change(event){
        this.setState({
            [event.target.id]: event.target.value
        });
        if(event.target.value !== ''){
            event.target.parentElement.classList.add('active');
        }
    }

    toggle(){
        if (typeof this.props.toggle === 'function') {
            this.props.toggle();
        }
    }
    renderRepeatPass(){
        const { isUserCreated } = this.state;
        if(isUserCreated){
            return <div className="flex-input">
                <label htmlFor="passwordRepeat">Confirm Password</label>
                <input id="passwordRepeat"
                       type="password"
                       onFocus={this.focusInput.bind(this)}
                       onBlur={this.blurInput.bind(this)}
                       value={this.state.passwordRepeat}
                       onChange={this.change.bind(this)}
                />
            </div>
        }
    }

    render() {
        const { validationPassword, password, email } = this.state;
        return (
            <div className="sign-in-wrap">
                <header className="auth-header">
                    <h2 className="title">Welcome to app</h2>
                </header>
                <form className="auth-form" onSubmit={this.submit.bind(this)}>
                    <div className="flex-input">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                               type="email"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={email}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="password">Password</label>
                        <input id="password"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={password}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validationPassword}</span>
                    </div>
                    {this.renderRepeatPass()}
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