import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {isValidEmail, isValidPassword} from "../../../api/lib/validation.js";
import {warning} from "/imports/api/lib/alerts";
import request from 'request';
import config from '/imports/api/config/config.json';


class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validation: {
                email: '',
                password: '',
                username: ''
            },
            firstName: '',
            lastName: '',
            email: '',
            emailProvider: '',
            password: '',
            repeatPassword: '',
            username: ''
        }

        this.receiveMessageFromGoolgeAuthWindow = this.receiveMessageFromGoolgeAuthWindow.bind(this);
    }

    toggle() {
        if (typeof this.props.toggle === 'function') {
            this.props.toggle();
        }
    }

    Check(validation) {
        this.setState({validation: Object.assign(this.state.validation, validation)});
    }

    emailValidationError() {
        const {validation} = this.state;

        if (validation.email) {
            return validation.email;
        } else if (validation.emailProvider) {
            return validation.emailProvider;
        }
    }

    submit(event) {
        event.preventDefault();
        const {username, password, email, emailProvider, repeatPassword, validation, firstName, lastName} = this.state;
        if (username == '') {
            validation.username = "Field is required";
            return this.Check(validation);
        } else if (username.length < 3) {
            validation.username = "Username must be longer";
            return this.Check(validation);
        }
        if (!isValidEmail(email)) {
            validation.email = "Please enter valid e-mail address";
            return this.Check(validation);
        }
        if (emailProvider == '') {
            validation.emailProvider = 'Email provider is required';
            return this.Check(validation);
        }
        if (!isValidPassword(password, 6)) {
            validation.password = "Please enter valid password";
            return this.Check(validation);
        }
        if (password && password !== repeatPassword) {
            validation.password = "Passwords doesn't match";
            return this.Check(validation);
        }

        this.userRegistrationData = {
                username,
                email,
                emailProvider,
                password,
                firstName,
                lastName
            };

        if(emailProvider == 'gmail') {
            const url = require('url');
            googleUrl = url.format({
                protocol: 'https',
                host: 'accounts.google.com/o/oauth2/auth',
                query: {
                    response_type: 'code',
                    //state: state,
                    client_id: config.google.clientId,
                    redirect_uri: config.google.redirectUri,
                    access_type: 'offline',
                    scope: 'https://www.googleapis.com/auth/userinfo.email \
                            https://www.googleapis.com/auth/userinfo.profile \
                            https://mail.google.com/ \
                            https://www.google.com/m8/feeds \
                            https://www.googleapis.com/auth/calendar',
                    login_hint: email,
                    prompt: 'consent'
                }
            });

            const myPopup = window.open(googleUrl, "Google authentication", "width=730,height=650");

            window.addEventListener("message", this.receiveMessageFromGoolgeAuthWindow, false);
        } else {
            this.userRegistration();
        }
    }

    userRegistration() {
        userData = this.userRegistrationData;
        console.log("UserRegistration method invoked with data", userData);
        Meteor.call("userRegistration", userData, (err, res) => {console.log("Signup", res);
            if (!err) {
                const {email, password, validation} = res;
                if (validation.email || validation.username) {
                    this.Check(validation);
                } else {
                    Meteor.loginWithPassword({email}, password, (err) => {
                        if (err) return warning('Login error, please try again!');
                        FlowRouter.reload();
                    });
                }
            }
        })
    }

    receiveMessageFromGoolgeAuthWindow(event) {
        console.log("Event arrived from other window", event);

        const code = event.data;
        if(code) {
            options = {
                method: 'POST',
                url: 'https://www.googleapis.com/oauth2/v4/token',
                form: {
                    code: code,
                    grant_type: 'authorization_code',
                    client_id: config.google.clientId,
                    client_secret: config.google.clientSecret,
                    redirect_uri: config.google.redirectUri
                },
                json: true
            };
            request(options, (error, response, body) => {
                console.log("GoogleAPIToken result", error, response, body);

                if(!error && body) {

                    const googleAccessToken = body.access_token;
                    const googleRefreshToken = body.refresh_token;

                    if(googleAccessToken && googleRefreshToken) {
                        request({
                            method: 'GET',
                            url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleAccessToken}`,
                            json: true
                        }, (error, response, body)=>{
                            console.log("GoogleUserInfo api result", error, response, body);
                            if(!error && body) {

                                const googleEmail = body.email;

                                if(googleEmail != this.userRegistrationData.email) {
                                    return warning('Registraion email is different from Google authentication email!');
                                } else {
                                    this.userRegistrationData.googleRefreshToken = googleRefreshToken;

                                    this.userRegistration();
                                }
                            }
                        })
                    }
                }

            })
        }
    }

    focusInput(event) {
        const {validation} = this.state;
        event.target.parentElement.classList.add('active');
        if (validation[event.target.id]) {
            this.setState({validation: Object.assign(validation, {[event.target.id]: ''})});
        }
    }

    blurInput(event) {
        const value = event.target.value;
        const {validation} = this.state;
        if (value === '' && event.target.id != 'emailProvider') {
            event.target.parentElement.classList.remove('active');
        }
        switch (event.target.id) {
            case 'email':
                if (!isValidEmail(value))
                    this.setState({validation: Object.assign(validation, {email: "Please enter valid e-mail address"})});
                break;
            case 'emailProvider':
                if (value === '')
                    this.setState({validation: Object.assign(validation, {emailProvider: "Email provider is required"})});
                break;
            case 'username':
                if (value === '')
                    this.setState({validation: Object.assign(validation, {username: "Username is required"})});
                break;
            case 'repeatPassword':
                if (value !== this.state.password)
                    this.setState({validation: Object.assign(validation, {password: "Passwords doesn't match"})});
                break;
            default:
                return true;
        }
    }

    change(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
        if (event.target.value !== '') {
            event.target.parentElement.classList.add('active')
        }
    }

    render() {
        const {validation, firstName, lastName, username, email, emailProvider, password, repeatPassword} = this.state;
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
                               value={firstName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={lastName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="username">Username</label>
                        <input id="username"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={username}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.username}</span>
                    </div>
                    <div className="flex-input-select">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                               type="email"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={email}
                               onChange={this.change.bind(this)}
                        />
                        <select id="emailProvider"
                                onFocus={this.focusInput.bind(this)}
                                onBlur={this.blurInput.bind(this)}
                                onChange={this.change.bind(this)}>
                            <option value="">-----</option>
                            <option value="gmail">Gmail</option>
                            <option value="exchange">Exchange</option>
                            <option value="icloud">iCloud</option>
                            <option value="outlook">Outlook</option>
                            <option value="yahoo">Yahoo</option>
                        </select>
                        <span className="validation">{this.emailValidationError()}</span>
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
                        <span className="validation">{validation.password}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="repeatPassword">Repeat password</label>
                        <input id="repeatPassword"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={repeatPassword}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <button className="btn login-btn" type="submit">Registrate</button>
                </form>
                <footer className="auth-footer">
                    <button onClick={this.toggle.bind(this)}
                            className="toggle-auth">I have account
                    </button>
                </footer>
            </div>
        )
    }
}
export default SignUp;