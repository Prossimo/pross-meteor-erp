import React from 'react';
import { ADMIN_ROLE_LIST, EMPLOYEE_ROLE } from '/imports/api/constants/roles';
import Popup from '../popup/Popup';
import AddQuoteForm from './AddQuoteForm';

class Quotes extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showPopup: false,
            popupData: null
        }
    }
    previewQuote(event){
        if(event.target.nodeName !== 'A') {
            $(event.currentTarget.querySelector('.quote-revision')).slideToggle();
        }
    }

    hidePopup(){
        this.setState({showPopup: false, popupData: null})
    }

    showAddQuoteForm(){
        const { project, usersArr, currentUser } = this.props;
        this.setState({
            showPopup: true,
            popupData: <AddQuoteForm hide={this.hidePopup.bind(this)}
                                     currentUser={currentUser}
                                     usersArr={usersArr}
                                     project={project}/>
        })
    }

    renderPopup(){
        const { popupData, showPopup } = this.state;
        return <Popup active={showPopup}
                      title="Add quote"
                      hide={this.hidePopup.bind(this)}
                      content={popupData}/>
    }

    renderQuotes(){
        const { quotes } = this.props;
        return(
            <ul className="quotes-list">
                {quotes.map(item=>{
                    return(
                        <li key={item._id}
                            onClick={this.previewQuote.bind(this)}

                            className="single-quota">
                            <div className="flex-container">
                                <div className="desc-part">
                                    <h3 className="title">{item.name}</h3>
                                    <h4 className="revision-umber">{item.revisionNumber}</h4>
                                </div>
                                <div className="control-part">
                                    <a href={item.url}
                                       download={item.attachedFile.name}
                                       className="btn primary-btn">Quota PDF</a>
                                </div>
                            </div>
                            <div className="quote-revision">
                                <ul className="revision-list">
                                    <li className="revision-item">revision #3443534</li>
                                    <li className="revision-item">revision #3443523</li>
                                    <li className="revision-item">revision #3443523</li>
                                    <li className="revision-item">revision #3443543</li>
                                    <li className="revision-item">revision #3445454</li>
                                </ul>
                            </div>
                        </li>
                    )
                })}
            </ul>
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