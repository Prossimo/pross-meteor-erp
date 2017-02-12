import React from 'react';
import Alert from 'react-s-alert';
import { Files } from '/imports/api/lib/collections';
import { getUserName, getUserEmail } from '../../../api/lib/filters';
import { generateEmailHtml } from '/imports/api/lib/functions';

class AddQuoteForm extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currentFile: null,
            quoteName: ''
        }
    }

    changeFileInput(event){
        if(event.target.files.length){
            if(event.target.files[0].type !== "application/pdf") return (
                Alert.warning(`You can add only PDF files!`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                })
            );

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

    inputChange(event){
        this.setState({quoteName: event.target.value})
    }

    formSubmit(event){
        event.preventDefault();

        const { currentFile, quoteName } = this.state;
        const { project, usersArr, currentUser } = this.props;

        if(!currentFile){
            Alert.warning(`You must add PDF file`, {
                position: 'bottom-right',
                effect: 'bouncyflip',
                timeout: 5000
            });
            return this.setState({formValidation: false});
        }
        if(quoteName === ''){
            Alert.warning(`Empty quote name`, {
                position: 'bottom-right',
                effect: 'bouncyflip',
                timeout: 5000
            });
            return this.setState({formValidation: false});
        }

        const quoteData = {
            name: quoteName,
            revisionNumber: '',
            createBy: Meteor.userId(),
            createAt: new Date(),
            projectId: project._id,
            attachedFile: {
                name: currentFile.name,
                type: currentFile.type,
                fileId: null
            }
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
            if(err){
                Alert.warning("Email sending failed", {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                });
            }
            Alert.info(res, {
                position: 'bottom-right',
                effect: 'bouncyflip',
                timeout: 3500
            });
        };

        const addQuoteCb = (err)=>{
            if(err) return console.log(err);
            this.hide();
            Alert.info(`Add new quote`, {
                position: 'bottom-right',
                effect: 'bouncyflip',
                timeout: 5000
            });

            Meteor.call("sendEmail", {
                to: memberEmails,
                from: 'mail@prossimo.us',
                subject: `Add new quote in ${project.name} project`,
                replyTo: `[${getUserName(currentUser)}] from Prossimo <${getUserEmail(currentUser)}>`,
                html: generateEmailHtml(currentUser, quoteData.name, FlowRouter.url(FlowRouter.current().path))
            },sendEmailCb);
        };

        const fileInsertCb = (err, res)=>{
            if (err) return console.log(err);
            this.setState({
                currentFile: null,
                quoteName: ''
            });
            quoteData.attachedFile.fileId = res._id;

            Meteor.call("addNewQuote", quoteData, addQuoteCb )
        };

        Files.insert(file, fileInsertCb);
    }

    hide(){
        const { hide } = this.props;
        if(typeof hide === 'function'){
            hide();
        }
    }

    render() {
        const { quoteName } = this.state;
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
                        <span className="label">Add pdf file</span>
                        <label htmlFor="quote-file"
                               className="file-label"/>
                        <input type="file"
                               id="quote-file"
                               onChange={this.changeFileInput.bind(this)}/>
                        {this.renderAttachedFile()}
                    </div>
                    <button className="btn primary-btn">Add quote</button>
                </form>
            </div>
        )
    }
}

export default AddQuoteForm;