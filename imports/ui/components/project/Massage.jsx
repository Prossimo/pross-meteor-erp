import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { getUserName } from '../../../api/lib/filters'


class Massage extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        const { msg } = this.props;

        return (
            <li className="activity-msg">
                <div className="avatar">
                    <img src="https://avatars.slack-edge.com/2017-02-15/141312992880_1fdac15514b222d3078a_48.png" alt="user avatar"/>
                </div>
                <div className="info">
                    <span className="author">{msg.user}</span>
                    <span className="date">{moment(msg.createAt).format("dddd, MMMM Do YYYY, h:mm ")}</span>
                </div>
                <div className="text">{msg.text}</div>
            </li>
        )
    }
}

export default Massage;

