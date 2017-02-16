import React from 'react';
import classNames from 'classnames';
import Textarea from 'react-textarea-autosize';
import Select from 'react-select';
import { getUserName, getUserEmail } from '/imports/api/lib/filters';
import { simpleEmail } from '/imports/api/lib/functions';
import { info, warning } from '/imports/api/lib/alerts';

class ConversationBox extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            text: '',
            subject: '',
            selectUsers: props.members.map(memberId=>{
                return{
                    label: getUserName(props.usersArr[memberId], true),
                    value: memberId
                }
            }),
            selectOptions: props.users.map(item=>{return {label: getUserName(item, true), value: item._id}})
        }
    }

    changeText(event){
        this.setState({text: event.target.value})
    }

    changeSelectUser(selectUsers){
        this.setState({selectUsers})
    }

    sendMessage(){
        const { usersArr, currentUser, label } = this.props;
        const { selectUsers, text, subject } = this.state;
        const memberEmails = selectUsers.map(item=>{
            return getUserEmail(usersArr[item.value])
        });
        const membersId = selectUsers.map(item=>{
            return item.value;
        });

        if(!text) return warning("Write a message! Field is empty!");
        if(!subject) return warning("Write a subject!");
        if(!memberEmails.length) return warning("Nobody to send!");

        const sendEmailCb = (err)=>{
            if(err) return console.log(err);
            info(`Email send`);
            this.setState({
                subject: '',
                text: ''
            })
        };

        //todo more test

        Meteor.call('updateUserConversationGroups', label, membersId,(err)=>{
            if(err) return warning("Conversation group update failed!");
            info("Conversation group update success!")
        });

        Meteor.call("sendEmail", {
            to: memberEmails,
            from: 'mail@prossimo.us',
            subject: subject,
            replyTo: `[${getUserName(currentUser)}] from Prossimo <${getUserEmail(currentUser)}>`,
            html: simpleEmail(currentUser, text)
        },sendEmailCb);
    }

    changeSubject(event){
        this.setState({subject: event.target.value})
    }

    render() {
        const { selectUsers, selectOptions, subject } = this.state;

        return (
            <div>
                <div className="flex-container">
                    <div className="left-part">
                    <div className="field-wrap">
                        <input type="text"
                               value={subject}
                               onChange={this.changeSubject.bind(this)}
                               placeholder="Subject"/>
                    </div>
                    <Textarea rows={5}
                              placeholder="Enter message"
                              className="conversation-textarea"
                              value={this.state.text}
                              onChange={this.changeText.bind(this)}/>
                    </div>
                    <div className="right-part">
                        <div className="select-wrap">
                            <Select
                                multi
                                placeholder='Select members'
                                value={selectUsers}
                                onChange={this.changeSelectUser.bind(this)}
                                options={selectOptions}
                                className={"members-select"}
                                clearable={false}
                            />
                        </div>
                    </div>
                </div>

                <button onClick={this.sendMessage.bind(this)}
                        className="btn primary-btn">Send message</button>
            </div>
        )
    }
}

class Conversations extends React.Component{
    constructor(props){
        super(props);
        const { profile } = props.currentUser;
        if(Array.isArray(profile.conversationGroups) && profile.conversationGroups.length){
            this.tabs = profile.conversationGroups.map(item=>{
                return {
                    label: item.name,
                    content: <ConversationBox currentUser={props.currentUser}
                                              usersArr={props.usersArr}
                                              users={props.users}
                                              label={item.name}
                                              members={item.members} />
                }
            });
        }else{
            this.tabs = [
                {
                    label: "Stakeholders",
                    content: <ConversationBox usersArr={props.usersArr}
                                              label={"Stakeholders"}
                                              currentUser={props.currentUser}
                                              users={props.users}
                                              members={[]}/>
                }
            ]
        }



        this.state = {
            activeTab: this.tabs[0],
        }
    }

    toggleTab(activeTab){
        this.setState({activeTab})
    }
    getTabs(){
        const { activeTab } = this.state;

        return (
            <ul>
                {this.tabs.map(item=>{
                    return (
                        <li key={item.label}
                            onClick={this.toggleTab.bind(this, item)}
                            className={classNames({"active": item === activeTab})}
                        >{item.label}</li>
                    )
                })}
            </ul>
        )
    }
    getContent(){
        const { activeTab } = this.state;
        if(activeTab.component){
            return React.cloneElement(activeTab.component, this.props);
        }else{
            return activeTab.content
        }
    }

    render() {
        return (
            <div className="conversations-tab">
                <div className="tab-container">
                    <div className="tab-controls">
                        {this.getTabs()}
                    </div>
                    <div className="tab-content">
                        {this.getContent()}
                    </div>
                </div>
            </div>
        )
    }
}

export default Conversations;