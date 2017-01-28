import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';


class SignUp extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div>
                <h1>Sign up form (not working now)</h1>
                <form action="#">
                    <input type="text"/>
                    <input type="text"/>
                    <button>Submit</button>
                </form>
            </div>
        )
    }
}
export default SignUp;