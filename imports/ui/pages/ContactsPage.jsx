import React from 'react'
import ContactsList from '../components/contacts/ContactsList'
import ContactOverview from '../components/contacts/ContactOverview'

export default class ContactsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedContact: null,
            updatedContact: null,
            removedContact: null
        }
    }

    render() {
        return (
            <div className="contact-page">
                <ContactsList
                    onSelectContact={(contact) => this.setState({selectedContact: contact})}
                    updatedContact={this.state.updatedContact}
                    removedContact={this.state.removedContact}
                />
                <ContactOverview
                    contact={this.state.selectedContact}
                    onUpdatedContact={(contact) => {
                        this.setState({
                            selectedContact: contact,
                            updatedContact: contact
                        })
                    }}
                    onRemovedContact={(contact) => {
                        this.setState({
                            selectedContact: null,
                            removedContact: contact
                        })
                    }}
                />
            </div>
        )
    }
}

