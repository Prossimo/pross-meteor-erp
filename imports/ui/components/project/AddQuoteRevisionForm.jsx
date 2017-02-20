import React from 'react';
import Alert from 'react-s-alert';
import { Files } from '/imports/api/lib/collections';
import { getUserName, getUserEmail, getAvatarUrl, getSlackUsername } from '../../../api/lib/filters';
import { generateEmailHtml } from '/imports/api/lib/functions';
import { warning, info } from '/imports/api/lib/alerts';

class AddQuoteForm extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currentFile: null,
            totalCost: ''
        }
    }

    changeFileInput(event){
        if(event.target.files.length){
            if(event.target.files[0].type !== "application/pdf") {
                return  this.showWarning(`You can add only PDF files!`);
            }

            this.setState({
                currentFile: event.target.files[0]
            })
        }
    }

    renderAttachedFile(){
        const { currentFile } = this.state;
        if(currentFile){
            return (
                <div className="attached-file">
                    <span className="file-name">{currentFile.name}</span>
                </div>
            )
        }
    }

    formSubmit(event){
        event.preventDefault();

        const { currentFile, totalCost } = this.state;
        const { project, usersArr, currentUser, quote } = this.props;

        if(!currentFile)return this.showWarning(`You must add PDF file`);
        if(totalCost === '')return this.showWarning(`Empty total cost field`);

        const params = {
            username: getSlackUsername(usersArr[Meteor.userId()]),
            icon_url: getAvatarUrl(usersArr[Meteor.userId()]),
            attachments: [
                {
                    "color": "#36a64f",
                    "text": `<${FlowRouter.url(FlowRouter.current().path)}|Go to revision #${quote.revisions.length}>`

                }
            ]
        };

        const slackText = `Add revision #${quote.revisions.length}
        to ${quote.name} by ${getUserName(currentUser, true)}`;

        Meteor.call("sendBotMessage", project.slackChanel, slackText, params);

        const revisionData = {
            quoteId: quote._id,
            revisionNumber: quote.revisions.length,
            totalPrice: parseFloat(totalCost),
            createBy: Meteor.userId(),
            createAt: new Date(),
            fileName: currentFile.name,
            fileId: null
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

        const addRevisionQuoteCb = (err)=>{
            this.hide();

            if(err) return warning(err.reason);

            this.info(`Add new revision`);

            Meteor.call("sendEmail", {
                to: memberEmails,
                from: 'mail@prossimo.us',
                subject: `Add new revision to quote in ${project.name} project`,
                replyTo: `[${getUserName(currentUser)}] from Prossimo <${getUserEmail(currentUser)}>`,
                html: generateEmailHtml(currentUser, `${quote.name} - revision number: ${revisionData.revisionNumber} `, FlowRouter.url(FlowRouter.current().path))
            },sendEmailCb);
        };

        const fileInsertCb = (err, res)=>{
            if (err) return warning(err.reason);
            this.setState({
                currentFile: null,
                quoteName: ''
            });
            info("Success upload file");
            revisionData.fileId = res._id;

            Meteor.call("addRevisionQuote", revisionData, addRevisionQuoteCb)
        };

        Files.insert(file, fileInsertCb);
    }

    hide(){
        const { hide } = this.props;
        if(typeof hide === 'function'){
            hide();
        }
    }

    totalChange(event){
        this.setState({totalCost: event.target.value})
    }

    render() {
        const { totalCost } = this.state;
        const { quote } = this.props;
        return (
            <div className="add-quote-form">
                <form className="default-form" onSubmit={this.formSubmit.bind(this)}>
                    <div className="field-wrap">
                        <span className="label">{quote.name}</span>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Revision number {quote.revisions.length}</span>
                    </div>

                    <div className="field-wrap">
                        <span className="label">Total cost ($)</span>
                        <input type="number"
                               onChange={this.totalChange.bind(this)}
                               value={totalCost}/>
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
                    <button className="btn primary-btn">Add revision</button>
                </form>
            </div>
        )
    }
}

export default AddQuoteForm;