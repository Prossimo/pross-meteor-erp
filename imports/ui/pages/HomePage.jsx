import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

class HomePage extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="home-page">
                <h1>Home page</h1>
            </div>
        )
    }
}
export default  HomePage;