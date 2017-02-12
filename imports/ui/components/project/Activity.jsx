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
            msg: localStorage.getItem("Activity.writingMsg") || '',
            attachedFiles: []
        }
    }

    changeMsg(event){
        this.setState({msg: event.target.value});
    }

    saveLS(event){
        localStorage.setItem("Activity.writingMsg", event.target.value);
    }

    loadFile(event){
        const { attachedFiles } = this.state;
        let attachedArr = [...attachedFiles];
        attachedArr.push(event.target.files[0]);
        this.setState({attachedFiles: attachedArr})
    }

    sendMsg(event){
        const { project, currentUser, usersArr } = this.props;
        const { msg, attachedFiles } = this.state;

        const memberEmails = project.members.map(item=>{
            return getUserEmail(usersArr[item]);
        });

         const sendEmailCb = (err)=> {
            if(!err){
                Alert.info(`Emails sending to project members`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 3500
                });
            }
        }
        if(memberEmails.length){
            Meteor.call("sendEmail", {
                to: memberEmails,
                from: 'mail@prossimo.us',
                subject: `New activity message from ${project.name} project`,
                replyTo: `[${getUserName(currentUser)}] from Prossimo <${getUserEmail(currentUser)}>`,
                html: generateEmailHtml(currentUser, msg, FlowRouter.url(FlowRouter.current().path))
            },sendEmailCb);
        }

        if(msg === '') return;
        let data = {
            createAt: new Date(),
            msg,
            attachments: [],
            projectId: project._id
        };
        let files = [];

        function readAttached(reader, attachedFiles, index) {
            if(attachedFiles[index]){
                reader.readAsDataURL(attachedFiles[index]);
            }else{
                return true;
            }
        }

        //todo add mongo-grid package
        if(attachedFiles.length){
            let reader = new FileReader;
            let step = 0;
            reader.addEventListener('load',()=>{
                const insertData = {
                    name: attachedFiles[step].name,
                    size: attachedFiles[step].size,
                    type: attachedFiles[step].type,
                    createAt: moment().toDate(),
                    dataURL: reader.result
                };
                files.push(insertData);
                if(readAttached(reader, attachedFiles, ++step)){
                    Meteor.call('createMassage', data, files);
                }
            });
            readAttached(reader, attachedFiles, step)
        }else{
            Meteor.call('createMassage', data);
        }
        this.setState({msg: '', attachedFiles: []});
        localStorage.setItem("Activity.writingMsg", '');
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

    getAttachedFiles(){
        const { attachedFiles } = this.state;
        if(attachedFiles.length){
            return (
                <div className="attached-list">
                    {attachedFiles.map((item,index)=>{
                        return <span key={item.size+index}
                                     className="attached-files"
                                     onClick={this.deleteAttached.bind(this, item)}
                        >{item.name}</span>
                    })}
                </div>
            )
        }
    }

    deleteAttached(item){
        const { attachedFiles } = this.state;
        const deleteIndex = attachedFiles.indexOf(item);
        let filterArr = [...attachedFiles.splice(0,deleteIndex)];
        filterArr.push(...attachedFiles.splice(deleteIndex+1));
        this.setState({attachedFiles: filterArr});
    }

    render() {
        const { msg } = this.state;

        return (
            <div className="activity">
                <div className="text-area-wrap">
                    <div className="user-info">
                        <img src="/icons/user.png"
                             alt="user avatar"/>
                    </div>
                    <Textarea rows={3}
                              placeholder="Write your message..."
                              onChange={this.changeMsg.bind(this)}
                              onBlur={this.saveLS.bind(this)}
                              value={msg}
                    />
                    <label htmlFor="attach-file"
                           className="add-doc-controls"/>
                    <input id="attach-file"
                           type="file"
                           onChange={this.loadFile.bind(this)} />
                </div>
                <div className="msg-controls">
                    <button className="btn send-msg"
                            onClick={this.sendMsg.bind(this)}>Send message</button>
                </div>
                {this.getAttachedFiles()}
                {this.getMassageList()}
            </div>
        )
    }
}

export default  Activity;