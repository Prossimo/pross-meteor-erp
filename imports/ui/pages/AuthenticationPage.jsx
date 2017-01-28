import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

import SignIn from '../components/authentication/SignIn';
import SignUp from '../components/authentication/SignUp';

class AuthenticationPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            signIn: true
        }
    }

    render() {
        return (
            <div className="auth-container">
                {this.state.signIn === true ? <SignIn/> : <SignUp/>}
            </div>
        )
    }
}
export default  AuthenticationPage;