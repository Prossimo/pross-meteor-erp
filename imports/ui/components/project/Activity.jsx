import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Massage from './Massage';
import Textarea from 'react-textarea-autosize';
import { getUserName, getUserEmail } from '../../../api/lib/filters';
import { generateEmailHtml } from '/imports/api/lib/functions';
import Alert from 'react-s-alert';


class Activity extends React.Component{
    constructor(props){
        super(props);

        this.state = {

        }
    }


    getMassageList(){
        //todo refactor
        return(
            <div className="massage-list">
                <ul>
                    {this.props.messages.map(item=>{
                        if(item.type === 'message'){
                            return (
                                <Massage key={item._id}  msg={item}/>
                            )
                        }else if(item.type === 'event'){
                            return (
                                <li key={item._id}
                                    className="event-message">
                                    {getUserName(item.author, true)}
                                    {item.name} at
                                    {moment(item.createAt).format("h:mm, MMMM Do YYYY")}
                                </li>
                            )
                        }
                    })}
                </ul>
            </div>
        )
    }


    render() {
        return (
            <div className="activity">
                {this.getMassageList()}
            </div>
        )
    }
}

export default  Activity;