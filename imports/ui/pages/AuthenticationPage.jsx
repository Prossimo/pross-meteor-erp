import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

import SignIn from '../components/authentication/SignIn';
import SignUp from '../components/authentication/SignUp';

class AuthenticationPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            signIn: false
        };

        this.toggleAuth = this.toggleAuth.bind(this)
    }

    toggleAuth(){
        const { signIn } = this.state;
        this.setState({signIn: !signIn});
    }

    render() {
        let { signIn } = this.state;
        return (
            <div className="auth-container">
                {signIn ? <SignIn toggle={this.toggleAuth}/> : <SignUp toggle={this.toggleAuth}/>}
            </div>
        )
    }
}

export default  AuthenticationPage;