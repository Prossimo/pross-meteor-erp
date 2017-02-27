import React from 'react';
import Alert from 'react-s-alert';
import { Files } from '/imports/api/lib/collections';
import { getUserName, getUserEmail, getSlackUsername, getAvatarUrl } from '../../../api/lib/filters';
import { generateEmailHtml } from '/imports/api/lib/functions';
import { warning, info } from '/imports/api/lib/alerts';

class AddQuoteForm extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currentFile: null,
            quoteName: '',
            totalCost: '',
            alertsActive: true
        }
    }

    changeFileInput(event){
        if(event.target.files.length){
            if(event.target.files[0].type !== "application/pdf") {
                return warning("You can add only PDF files!");
            }

            this.setState({
                currentFile: event.target.files[0]
            })
        }
    }

    renderAttachedFile(){
        const { currentFile } = this.state;
        if(!currentFile) return null;

        return (
            <div className="attached-file">
                <span className="file-name">{currentFile.name}</span>
            </div>
        )
    }

    inputChange(event){
        this.setState({quoteName: event.target.value})
    }

    formSubmit(event){
        event.preventDefault();

        const { currentFile, quoteName, totalCost, alertsActive } = this.state;
        const { project, usersArr, currentUser } = this.props;

        if(!currentFile)return warning(`You must add PDF file`);
        if(quoteName === '')return warning(`Empty quote name`);
        if(totalCost === '')return warning(`Empty total cost field`);

        const quoteData = {
            name: quoteName,
            createAt: new Date(),
            projectId: project._id,
            revisions: [
                {
                    revisionNumber: 0,
                    totalPrice: parseFloat(totalCost),
                    fileName: currentFile.name,
                    fileId: null,
                    createBy: Meteor.userId(),
                    createAt: new Date(),
                }
            ],
        };

        const file = new FS.File(currentFile);
        file.metadata = {
            userId: Meteor.userId(),
            projectId: project._id,
            createAt: new Date
        };

        const memberEmails = project.members.map(item=>{
            return getUserEmail(usersArr[item]);
        });

        const sendEmailCb = (err,res)=> {
            if(err)return warning("Email sending failed");

            info(res);
        };

        const addQuoteCb = (err)=>{
            if(err) return console.log(err);
            this.hide();
            info(`Add new quote`);

            if(!alertsActive) return;

            Meteor.call("sendEmail", {
                to: memberEmails,
                from: 'mail@prossimo.us',
                subject: `Add new quote in "${project.name}" project`,
                replyTo: `[${getUserName(currentUser)}] from Prossimo <${getUserEmail(currentUser)}>`,
                attachments: [quoteData.revisions[0].fileId],
                html: generateEmailHtml(currentUser, `Go to project "${project.name}"`, FlowRouter.url(FlowRouter.current().path))
            },sendEmailCb);
        };

        const fileInsertCb = (err, res)=>{
            if (err) return console.log(err);
            this.setState({
                currentFile: null,
                quoteName: ''
            });

            quoteData.revisions[0].fileId = res._id;
            Meteor.call("addNewQuote", quoteData, addQuoteCb);

            if(typeof project.slackChanel === 'undefined') return;

            const params = {
                username: getSlackUsername(usersArr[Meteor.userId()]),
                icon_url: getAvatarUrl(usersArr[Meteor.userId()]),
                attachments: [
                    {
                        "color": "#36a64f",
                        "text": `<${FlowRouter.url(FlowRouter.current().path)}|Go to project ${project.name}>`
                    }
                ]
            };

            const slackText = `I just added new quote "${quoteData.name}"`;

            Meteor.call("sendBotMessage", project.slackChanel, slackText, params);
        };

        Files.insert(file, fileInsertCb);
    }

    hide(){
        const { hide } = this.props;
        if(typeof hide === 'function') hide();
    }

    totalChange(event){
        this.setState({totalCost: event.target.value})
    }

    toggleCheck(){
        const { alertsActive } = this.state;
        this.setState({alertsActive: !alertsActive});
    }

    render() {
        const { quoteName, totalCost, alertsActive } = this.state;
        return (
            <div className="add-quote-form">
                <form className="default-form" onSubmit={this.formSubmit.bind(this)}>
                    <div className="field-wrap">
                        <span className="label">Quote title</span>
                        <input type="text"
                               onChange={this.inputChange.bind(this)}
                               value={quoteName}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Total price ($)</span>
                        <input type="number"
                               onChange={this.totalChange.bind(this)}
                               value={totalCost}/>
                    </div>
                    <div className="field-wrap">
                        <span className="revision-field">Revision # <span className="revision-label">0</span></span>
                    </div>

                    <div className="field-wrap">
                        <span className="label">Add pdf file</span>
                        <label htmlFor="quote-file"
                               className="file-label"/>
                        <input type="file"
                               id="quote-file"
                               onChange={this.changeFileInput.bind(this)}/>
                        {this.renderAttachedFile()}
                    </div>
                    <input type="checkbox"
                           id="alert-checkbox"
                           onChange={this.toggleCheck.bind(this)}
                           checked={alertsActive}
                           className="hidden-checkbox"/>
                    <label htmlFor="alert-checkbox"
                           className="check-label">Alert stakeholders</label>
                    <div className="submit-wrap">
                        <button className="btn primary-btn">Add quote</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default AddQuoteForm;