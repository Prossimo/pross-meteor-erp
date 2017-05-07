import React from 'react'
import {Modal} from 'react-bootstrap'
import ContactsList from '../components/contacts/ContactsList'
import ContactOverview from '../components/contacts/ContactOverview'
import ContactForm from '../components/contacts/ContactForm'
import {warning} from '/imports/api/lib/alerts'


export default class ContactsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showContactModal: false,
            creating: false,
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
                    onCreateContact={() => this.setState({showContactModal: true, creating:true})}
                    updatedContact={this.state.updatedContact}
                    removedContact={this.state.removedContact}
                />
                <ContactOverview
                    contact={this.state.selectedContact}
                    onRemoveContact={this.onRemoveContact}
                    onEditContact={() => this.setState({showContactModal: true, creating:false})}
                />
                {this.renderContactModal()}
            </div>
        )
    }

    renderContactModal() {
        const {showContactModal, selectedContact, creating} = this.state
        const title = selectedContact&&!creating ? 'Edit Contact' : 'Create Contact'

        return (
            <Modal show={showContactModal} onHide={() => {
                this.setState({showContactModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> {title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ContactForm contact={!creating?selectedContact:null} onSaved={this.onSavedContact}/>
                </Modal.Body>
            </Modal>
        )
    }

    onRemoveContact = (contact) => {

        if (confirm(`Are you sure to remove ${contact.name}?`)) {
            Meteor.call('removeContact', contact._id, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message);
                }

                this.setState({
                    selectedContact: null,
                    removedContact: contact
                })
            })
        }
    }

    onSavedContact = (contact, updating) => {
        this.setState({showContactModal: false})
        if(updating) {
            this.setState({
                updatedContact: contact,
                selectedContact: contact
            })
        }
    }
}

