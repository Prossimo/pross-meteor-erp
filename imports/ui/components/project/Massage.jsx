import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { getUserName, getAvatarUrl } from '../../../api/lib/filters'


class Massage extends React.Component{
    constructor(props){
        super(props);
        this.userName = props.msg.author ? getUserName(props.msg.author, true) : props.user;
    }

    render() {
        const { msg } = this.props;

        return (
            <li className="activity-msg">
                <div className="avatar">
                    <img src={getAvatarUrl(msg.author)} alt={this.userName}/>
                </div>
                <div className="info">
                    <span className="author">{this.userName}</span>
                    <span className="date">{moment(msg.createAt).format("dddd, MMMM Do YYYY, h:mm ")}</span>
                </div>
                <div className="text">{msg.text}</div>
            </li>
        )
    }
}

export default Massage;

