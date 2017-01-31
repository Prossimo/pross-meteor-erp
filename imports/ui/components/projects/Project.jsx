import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

class Project extends React.Component{
    constructor(props){
        super(props);

        this.projectList = [
            {
                name: "Foo",
                status: "baz",
            },
            {
                name: "Bar",
                status: "foo foo",
            }
        ];
    }

    render() {
        return (
            <div className="single-project">
                {this.props.id}
            </div>
        )
    }
}
export default Project;