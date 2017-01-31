import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Textarea from 'react-textarea-autosize';


class Massage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            editMode: false,
            text: props.msg.msg
        }
    }

    delete(){
        const { msg } = this.props;
        Meteor.call('deleteMsg', msg)
    }

    activeEdit(){
        const { editMode } = this.state;
        this.setState({editMode: !editMode});
    }

    changeText(event){
        this.setState({text: event.target.value})
    }

    saveEdited(){
        //todo err cb
        const { msg } = this.props;
        const { text } = this.state;
        Meteor.call('updateMsg', msg, text, (err)=>{
            if(!err)this.setState({editMode: false})
        })
    }

    cancelEdit(){
        const { msg } = this.props;
        this.setState({editMode: false, text: msg.msg })
    }

    getContent(){
        const { editMode, text } = this.state;
        const { msg } = this.props;
        if(editMode){
            return (
                <div>
                    <Textarea className="edit-msg"
                              value={text}
                              onChange={this.changeText.bind(this)}/>
                    <div className="msg-controls">
                        <button className="btn btn-update"
                                onClick={this.saveEdited.bind(this)}>Save edit</button>
                        <button className="btn btn-cancel"
                                onClick={this.cancelEdit.bind(this)}>Cancel edit</button>
                    </div>
                </div>
            )
        }else {
            return <div className="text">{msg.msg}</div>;
        }
    }

    getControls(){
        const { msg } = this.props;
        if(Meteor.userId() === msg.author._id){
            return (
                <div className="controls">
                    <span className="edit" onClick={this.activeEdit.bind(this)}/>
                    <span className="delete" onClick={this.delete.bind(this)}/>
                </div>
            )
        }else{
            return (
                <div className="controls">
                    <span className="replay"/>
                </div>
            )
        }
    }

    renderReplays(){
        //todo replays list rendering
    }

    render() {
        const { msg } = this.props;

        return (
            <li className="activity-msg">
                <div className="avatar">
                    <img src="/icons/user.png" alt="user avatar"/>
                </div>
                <div className="info">
                    <span className="author">{`${msg.author.profile.firstName} ${msg.author.profile.lastName}`}</span>
                    <span className="date">{moment(msg.createAt).format("dddd, MMMM Do YYYY, h:mm ")}</span>
                    {this.getControls()}
                </div>
                {this.getContent()}
            </li>
        )
    }
}

export default Massage;

