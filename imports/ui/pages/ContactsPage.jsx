import React from 'react'
import ContactsList from '../components/contacts/ContactsList'
import ContactOverview from '../components/contacts/ContactOverview'

export default class ContactsPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            selectedContact: null
        }
    }

    render() {
        return (
            <div className="contact-page">
                <ContactsList onSelectContact={(contact)=>this.setState({selectedContact:contact})}/>
                <ContactOverview contact={this.state.selectedContact}/>
            </div>
        )
    }
}

