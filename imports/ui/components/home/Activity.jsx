import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';


class Activity extends React.Component{
    constructor(props){
        super(props);

        this.state = {
           msg: localStorage.getItem("Activity.writingMsg") || ''
        }
    }

    changeMsg(event){
        this.setState({msg: event.target.value});
    }

    saveLS(event){
        localStorage.setItem("Activity.writingMsg", event.target.value);
    }

    loadFile(event){
        console.dir(event.target)
    }

    sendMsg(event){
        const { msg } = this.state;
        let data = {
            createAt: new Date(),
            msg,
            attachments: []
        };
        Meteor.call('createMassage', data);
        this.setState({msg: ''});
        localStorage.setItem("Activity.writingMsg", '');
    }


    render() {
        const { msg } = this.state;
        //TODO ALEX create component
        return (
            <div className="activity">
                <div className="text-area-wrap">
                    <div className="user-info">
                        <img src="/icons/user.png" alt="user avatar"/>
                    </div>
                    <textarea rows="3" placeholder="Write your message..."
                              onChange={this.changeMsg.bind(this)}
                              onBlur={this.saveLS.bind(this)}
                              value={msg}
                    />
                    <label htmlFor="attach-file" className="add-doc-controls"/>
                    <input id="attach-file" type="file" onChange={this.loadFile.bind(this)} />
                </div>
                <div className="msg-controls">
                    <button className="btn send-msg" onClick={this.sendMsg.bind(this)}>Send message</button>
                </div>


                <div className="massage-list">
                    <ul>
                        {this.props.messages.map(item=>{
                            return(
                                <li key={item._id}>{item.msg}</li>
                            )
                        })}
                    </ul>
                </div>

            </div>
        )
    }
}

export default  Activity;