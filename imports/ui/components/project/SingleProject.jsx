import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';

class SingleProject extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div> this is single project page</div>
        );
    }
}

export default createContainer(()=> {
    return {

    };
}, SingleProject);
