import React from 'react'
import ContactsList from '../components/contacts/ContactsList'

export default class ContactsPage extends React.Component{
    constructor(props){
        super(props);

    }

    render() {
        return (
            <div className="contacts-page">
                <ContactsList/>
            </div>
        )
    }
}

