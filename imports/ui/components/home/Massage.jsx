import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Textarea from 'react-textarea-autosize';


class Massage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            editMode: false,
            text: props.msg.msg,
            replayEditor: false,
            replayText: ''
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

    changeReplayText(event){
        this.setState({replayText: event.target.value})
    }

    saveEdited(){
        //todo err cb
        const { msg } = this.props;
        const { text } = this.state;
        Meteor.call('updateMsg', msg, text, (err)=>{
            if(!err)this.setState({editMode: false})
        })
    }

    saveReplay(){
        //todo functionality for replay

    }

    cancelEdit(){
        const { msg } = this.props;
        this.setState({editMode: false, text: msg.msg, replayEditor: false })
    }

    replay(){
        this.setState({replayEditor: true})
    }

    renderReplayEditor(){
        const { replayEditor, replayText } = this.state;

        if(replayEditor){
            return (
                <div>
                    <Textarea className="edit-msg"
                              value={replayText}
                              onChange={this.changeReplayText.bind(this)}/>
                    <div className="msg-controls">
                        <button className="btn btn-update"
                                onClick={this.saveReplay.bind(this)}>Replay</button>
                        <button className="btn btn-cancel"
                                onClick={this.cancelEdit.bind(this)}>Cancel</button>
                    </div>
                </div>
            )
        }
    }

    getContent(msg){
        const { editMode, text } = this.state;
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

    getControls(msg){
        if(Meteor.userId() === msg.author._id){
            return (
                <div className="controls">
                    <span className="edit"
                          onClick={this.activeEdit.bind(this)}/>
                    <span className="delete"
                          onClick={this.delete.bind(this)}/>
                </div>
            )
        }else{
            return (
                <div className="controls">
                    <span className="replay"
                          onClick={this.replay.bind(this)}/>
                </div>
            )
        }
    }
    preloadFile(item){
        Meteor.call('getFileDataURL', item.id, (err,res)=>{
            if(!err) {
                let link = document.querySelector(`#file-${item.id}`);
                let event  = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                link.href = res.dataURL;
                link.dispatchEvent(event);
            }
        })
    }

    renderReplays(msg){
        //todo refactor maybe add replay component
        const self = this;

        function render(item,index) {
            return(
                <li key={`${item}-${index}`}
                    className="activity-msg">
                    <div className="avatar">
                        <img src="/icons/user.png" alt="user avatar"/>
                    </div>
                    <div className="info">
                        <span className="author">{`${item.author.profile.firstName} ${item.author.profile.lastName}`}</span>
                        <span className="date">{moment(item.createAt).format("dddd, MMMM Do YYYY, h:mm ")}</span>
                        {self.getControls(item)}
                    </div>
                    {self.getContent(item)}
                    {self.renderAttachedFiles(item)}
                    {item.replays.length && item.replays.map((subItem,subIndex)=>render(item,index))}
                </li>
            )
        }

        if(msg.replays.length){
            return (
                <ul className="replay-list">
                    {msg.replays.map((item,index)=>render(item,index))}
                </ul>
            )
        }
    }

    renderAttachedFiles(msg){
        if(msg.attachments && msg.attachments.length){
            return(
                <ul className="msg-attached-list">
                    {msg.attachments.map(item=>{
                        return <li key={item.id}
                                   className="attached-item">
                            <span onClick={this.preloadFile.bind(this, item)}>{item.name}</span>
                            <a href="#" id={`file-${item.id || item}`} download={item.name}/>
                        </li>
                    })}
                </ul>
            )
        }

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
                    {this.getControls(msg)}
                </div>
                {this.getContent(msg)}
                {this.renderAttachedFiles(msg)}
                {this.renderReplayEditor()}
                {this.renderReplays(msg)}
            </li>
        )
    }
}

export default Massage;

