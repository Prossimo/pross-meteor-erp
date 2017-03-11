import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { getUserName, getAvatarUrl } from '../../../api/lib/filters'


class Massage extends React.Component{
    constructor(props){
        super(props);
        this.userName = props.message.author ? getUserName(props.message.author, true) : props.user;
    }

    //todo research https://api.slack.com/methods/files.sharedPublicURL

    renderFile(){
        const { message } = this.props;
        if(!message.file) return;
        const { file } = message;
        const url = file.permalink;

        if(/^image/.test(file.mimetype) && url){
            return <a href={url}>image permalink</a>
        }
    }

    render() {
        const { message } = this.props;
        return (
            <li className="activity-msg">
                <div className="avatar">
                    <img src={getAvatarUrl(message.author)} alt={this.userName}/>
                </div>
                <div className="info">
                    <span className="author">{this.userName}</span>
                    <span className="date">{moment(message.createAt).format("dddd, MMMM Do YYYY, h:mm ")}</span>
                </div>
                <div className="text">{message.text}</div>
                {this.renderFile()}
            </li>
        )
    }
}

export default Massage;

