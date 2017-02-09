import React from 'react';
import { ADMIN_ROLE_LIST, EMPLOYEE_ROLE } from '/imports/api/constants/roles';

class Quotes extends React.Component{
    constructor(props){
        super(props);

    }

    previewQuote(){
        console.log("previewQuote")
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
                            <div className="desc-part">
                                <h3 className="title">{item.name}</h3>
                                <h4 className="revision-umber">{item.revisionNumber}</h4>
                                <p className="status">{item.active ? "Active" : "No active"}</p>
                            </div>
                            <div className="control-part">
                                <button className="btn primary-btn">Quota file link</button>
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
                <button className="btn primary-btn">Add quote</button>
            </div>
        )
    }

    render() {

        return (
            <div className="quotes">
                {this.renderQuotes()}
                {this.renderAddQuotes()}
            </div>
        )
    }
}

export default  Quotes;