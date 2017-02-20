import React from 'react';
import { ADMIN_ROLE_LIST, EMPLOYEE_ROLE } from '/imports/api/constants/roles';
import Popup from '../popup/Popup';
import classNames from 'classnames';
import AddQuoteForm from './AddQuoteForm';
import AddQuoteRevisionForm from './AddQuoteRevisionForm';
import currencyFormatter from 'currency-formatter';

class Quotes extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showPopup: false,
            popupData: null,
            editQuoteNameMode: false,
        }
    }

    hidePopup(){
        this.setState({showPopup: false, popupData: null})
    }

    showAddQuoteForm(){
        const { project, usersArr, currentUser, quotes } = this.props;
        this.setState({
            showPopup: true,
            popupTitle: 'Add new quote',
            popupData: <AddQuoteForm hide={this.hidePopup.bind(this)}
                                     currentUser={currentUser}
                                     usersArr={usersArr}
                                     quotes={quotes}
                                     project={project}/>
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
        const { project, usersArr, currentUser, users } = this.props;
        this.setState({
            showPopup: true,
            popupTitle: `Add revision to ${quote.name}`,
            popupData: <AddQuoteRevisionForm hide={this.hidePopup.bind(this)}
                                             currentUser={currentUser}
                                             usersArr={usersArr}
                                             quote={quote}
                                             project={project} />
        })
    }

    changeEditMode(event){
        console.log("click")
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

    changeQuoteName(quote, event){
        if(event.key == 'Enter'){
            Meteor.call('editQuoteName', quote._id, event.target.value, (err)=>{
                if(err) return console.log(err);
            });
            event.target.value = '';
            this.setState({editQuoteNameMode: false});
        }
    }

    renderQuotes(){
        const { quotes } = this.props;

        if(quotes.length){
            return(
                <ul className="quotes-list">
                    {quotes.map(item=>{
                        const latest = item.revisions[item.revisions.length-1];
                        return(
                            <li key={item._id}

                                className="single-quota">
                                <div className="flex-container">
                                    <div className="desc-part">
                                        {this.renderQuoteName(item)}
                                        <p className="quote-info">Revision #{latest.revisionNumber}</p>
                                        <p className="quote-info">Total price {currencyFormatter.format(latest.totalPrice, {code: 'USD', locale: 'en-US', decimalDigits: 0})}</p>
                                    </div>
                                    <div className="control-part">
                                        <button onClick={this.addRevision.bind(this, item)}
                                                className="btn primary-btn">Upload revision</button>
                                        <a href={latest.url}
                                           download={latest.fileName}
                                           className="btn primary-btn"><i className="fa fa-download"/> Download PDF</a>
                                    </div>
                                </div>
                                <div className="quote-revision">
                                    <ul className="revision-list">
                                        {item.revisions && item.revisions.map(revision=>{
                                            if(revision === latest) return null;
                                            return(
                                                <li className="revision-item"
                                                    key={revision.fileId}>
                                                    <p>Revision #{revision.revisionNumber}</p>
                                                    <p>Uploaded: {moment(revision.createAt).format("h:mm, MMMM Do YYYY")}</p>
                                                    <p>Total price {currencyFormatter.format(revision.totalPrice, {code: 'USD', locale: 'en-US', decimalDigits: 0})}</p>
                                                    <a href={revision.url}
                                                       download={revision.fileName}
                                                       className="btn primary-btn"><i className="fa fa-download"/> Download PDF</a>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )
        }else{
            return (
                <div className="info-label">
                    <p>No quotes yet</p>
                </div>
            )
        }
    }

    renderQuoteName(item){
        const { editQuoteNameMode } = this.state;

        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])){
            return(
                <p className="title">{item.name}</p>
            )
        }

        return(
            <p className="title">
                <span className={classNames("quote-name", {"hide": editQuoteNameMode})}
                      onClick={this.changeEditMode.bind(this)}>{item.name}</span>
                <input type="text"
                       onKeyPress={this.changeQuoteName.bind(this, item)}
                       onBlur={this.blurInput.bind(this)}
                       className={classNames("quote-name-input", {"active": editQuoteNameMode})}
                />
            </p>
        )
    }

    renderAddQuotes(){
        if(!Roles.userIsInRole(Meteor.userId(), [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) return;

        return(
            <div className="add-quotes">
                <button onClick={this.showAddQuoteForm.bind(this)}
                        className="btn primary-btn">Add quote</button>
            </div>
        )
    }

    render() {
        return (
            <div className="project-quotes-tab">
                {this.renderPopup()}
                {this.renderQuotes()}
                {this.renderAddQuotes()}
            </div>
        )
    }
}

export default  Quotes;