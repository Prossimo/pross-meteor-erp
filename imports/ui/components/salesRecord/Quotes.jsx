import React from 'react';
import { ADMIN_ROLE_LIST, EMPLOYEE_ROLE } from '/imports/api/constants/roles';
import Popup from '../popup/Popup';
import classNames from 'classnames';
import AddQuoteForm from './AddQuoteForm';
import AddQuoteRevisionForm from './AddQuoteRevisionForm';
import currencyFormatter from 'currency-formatter';
import { info, warning } from '/imports/api/lib/alerts';
import _ from 'underscore';

class QuoteItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            editQuoteNameMode: false,
        }
    }

    renderQuoteName(quote){
        const { editQuoteNameMode } = this.state;

        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])){
            return <p className="title">{quote.name}</p>;
        }

        return(
            <p className="title">
                <span className={classNames("quote-name", {"hide": editQuoteNameMode})}
                      onClick={this.changeEditMode.bind(this)}>{quote.name}</span>
                <input type="text"
                       onKeyPress={this.changeQuoteName.bind(this)}
                       onBlur={this.blurInput.bind(this)}
                       className={classNames("quote-name-input", {"active": editQuoteNameMode})}
                />
            </p>
        )
    }

    changeEditMode(event){
        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) return;
        event.persist();
        this.setState({editQuoteNameMode: true});
        setTimeout(()=>{
            event.target.nextSibling.focus()
        },0)
    }

    blurInput(event){
        event.target.velue = '';
        this.setState({editQuoteNameMode: false})
    }

    changeQuoteName(event){
        const { quote } = this.props;

        if(event.key === 'Enter'){
            Meteor.call('editQuoteName', quote._id, event.target.value, (err)=>{
                if(err) return warning('Change quote name failed');

                info("Change quote name success!")
            });
            event.target.value = '';
            this.setState({editQuoteNameMode: false});
        }
    }

    addRevision(){
        const { quote, addRevision } = this.props;
        addRevision(quote)
    }

    render(){
        const { quote } = this.props;
        const lastRevisionNumber = Math.max(...quote.revisions.map(item=>item.revisionNumber));
        const latest = _.findWhere(quote.revisions, {revisionNumber: lastRevisionNumber});
        const revisions = quote.revisions
            .filter(revision=>revision!==latest)
            .sort((a,b)=>a.revisionNumber>b.revisionNumber?-1:1)
            .map(revision=>{
            return(
                <li className="revision-item"
                    key={revision.fileId}>
                    <p>Revision
                        <span className="revision-label"> # {revision.revisionNumber}</span></p>
                    <p>
                        <i className="fa fa-calendar-o"/> {moment(revision.createAt).format("MMMM Do YYYY")}</p>
                    <p>Total price {currencyFormatter.format(revision.totalPrice, {code: 'USD', locale: 'en-US', decimalDigits: 1})}</p>
                    <a href={revision.url}
                       download={revision.fileName}
                       className="btnn primary-btn"><i className="fa fa-download"/> PDF</a>
                </li>
            )
        })
        return(
            <li className="single-quota">
                <div className="flex-container">
                    <div className="desc-part">
                        {this.renderQuoteName(quote)}
                        <p className="quote-info">
                            <span className="latest-label">latest version</span>
                            Revision <span className="revision-label"> # {latest.revisionNumber}</span></p>
                        <p className="quote-info">
                            <i className="fa fa-calendar-o"/> {moment(latest.createAt).format("MMMM Do YYYY")}</p>
                        <p className="quote-info">
                            Total price: {currencyFormatter.format(latest.totalPrice, {code: 'USD', locale: 'en-US', decimalDigits: 0})}</p>
                    </div>
                    <div className="control-part">
                        <button onClick={this.addRevision.bind(this, quote)}
                                className="btnn primary-btn">
                            <i className="fa fa-plus"/> REVISION</button>
                        <a href={latest.url}
                           download={latest.fileName}
                           className="btnn primary-btn">
                            <i className="fa fa-download"/> PDF</a>
                    </div>
                </div>
                <div className="quote-revision">
                    <ul className="revision-list">{revisions}</ul>
                    {!_.isEmpty(revisions) && <span className="show-revisions"/>}
                </div>
            </li>
        )
    }
}

class Quotes extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showPopup: false,
            popupData: null
        }
    }

    componentDidMount(){
        this.slideToggle = function (event) {
            const quote = event.currentTarget;
            if( $(quote).hasClass('up')){
                $(quote).removeClass('up');
                $(quote).siblings('.revision-list').slideUp();
            }else {
                $(quote).addClass('up');
                $(quote).siblings('.revision-list').slideDown();
                $(quote).parents('.single-quota').siblings('.single-quota').find('.revision-list').slideUp();
                $(quote).parents('.single-quota').siblings('.single-quota').find('.show-revisions').removeClass('up');
            }
        };

        $(document).on('click', '.show-revisions', this.slideToggle);
    }

    componentWillUnmount(){
        $(document).off('click', '.show-revisions', this.slideToggle);
    }

    hidePopup(){
        this.setState({showPopup: false, popupData: null})
    }

    showAddQuoteForm(){
        const { salesRecord, usersArr, currentUser, quotes } = this.props;
        this.setState({
            showPopup: true,
            popupTitle: 'Add new quote',
            popupData: <AddQuoteForm hide={this.hidePopup.bind(this)}
                                     currentUser={currentUser}
                                     usersArr={usersArr}
                                     quotes={quotes}
                                     salesRecord={salesRecord}/>
        })
    }

    renderPopup(){
        const { popupData, showPopup, popupTitle } = this.state;
        return <Popup active={showPopup}
                      title={popupTitle}
                      hide={this.hidePopup.bind(this)}
                      content={popupData}/>
    }

    addRevision(quote){
        const { salesRecord, usersArr, currentUser } = this.props;
        this.setState({
            showPopup: true,
            popupTitle: `Add revision to ${quote.name}`,
            popupData: <AddQuoteRevisionForm hide={this.hidePopup.bind(this)}
                                             currentUser={currentUser}
                                             usersArr={usersArr}
                                             quote={quote}
                                             project={salesRecord} />
        })
    }

    renderQuotes(){
        const { quotes } = this.props;

        if(_.isEmpty(quotes))return <div className="info-label"><p>No quotes yet</p></div>;

        return <ul className="quotes-list">{quotes.map(quote=> {
            return <QuoteItem key={quote._id}
                              addRevision={this.addRevision.bind(this)}
                              quote={quote}/>
        })}
        </ul>
    }

    renderAddQuotes(){
        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) return null;

        return(
            <div className="add-quotes">
                <button onClick={this.showAddQuoteForm.bind(this)}
                        className="btnn primary-btn">Add quote</button>
            </div>
        )
    }
    
    getDriveFileList(e) {
        e.preventDefault();
<<<<<<< HEAD
        Meteor.call('getDriveFileList', (err, filesList) => {
=======
        Meteor.call('getDriveFileList', (err) => {
>>>>>>> set up google implementation server-to-server
            if (err) {
                console.log(err);
                return warning(err.message);
            }
<<<<<<< HEAD
            console.log('===get files list from google drive===');
            console.log(filesList);
            console.log('======================================');
=======
>>>>>>> set up google implementation server-to-server
        });
    }
    
    renderGoogleSignIn(){
        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) return null;
        
        return(
            <div className="add-quotes">
                <button onClick={this.getDriveFileList.bind(this)}
<<<<<<< HEAD
                        className="btnn primary-btn">Get google drive list of files</button>
=======
                        className="btnn primary-btn">SignIn Google</button>
>>>>>>> set up google implementation server-to-server
            </div>
        )
    }

    render() {
        return (
            <div className="project-quotes-tab">
                {this.renderPopup()}
                {this.renderQuotes()}
                {this.renderAddQuotes()}
                {this.renderGoogleSignIn()}
            </div>
        )
    }
}

export default  Quotes;
