import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Col, Form, FormGroup, ControlLabel} from 'react-bootstrap';


class SignIn extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            authError: false,
            validationError: ''
        }
    }

    submit(e){
        e.preventDefault();

        let username = this.refs.username.value.trim(),
            password = this.refs.password.value.trim();

        if (username && password) {
            Meteor.loginWithPassword({username}, password, (err) => {
                if (err) {
                    this.setState({authError: true});
                    setTimeout(()=>{
                        this.setState({authError: false});
                    },1000)
                }
                else {
                    FlowRouter.reload();
                }
            });
        }else{
            this.setState({
                validationError: "One or more fields are emptry!"
            });
        }

    }

    render() {
        return (
            <div className="sign-in-wrap">
                <h2>Sign in page</h2>
                <Form onSubmit={this.submit.bind(this)} className="entry-form" horizontal>
                    {this.state.authError ? <Col className="error-label">Authentification failed!!</Col> : null}
                    {this.state.validationError ? <Col className="error-label">{this.state.validationError}</Col> : null}

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={3}>
                            Username
                        </Col>
                        <Col sm={9}>
                            <input className="form-control" type="text" placeholder="Email" ref="username"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={3}>
                            Password
                        </Col>
                        <Col sm={9}>
                            <input className="form-control" type="password" placeholder="Password" ref="password"/>
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col sm={12} className="text-right">
                            <button className="btn btn-primary" type="submit">
                                Sign in
                            </button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}
export default SignIn;