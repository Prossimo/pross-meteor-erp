import React from 'react'
import {Table} from 'react-bootstrap'
import ContactStore from '../../../api/nylas/contact-store'

export default class extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)

        this.state = {
            contacts: ContactStore.getContacts(1)
        }
    }

    componentDidMount() {
        this.unlisten = ContactStore.listen(this.onContactStoreChanged)
    }

    componentWillUnmount() {
        if (this.unlisten) this.unlisten()
    }

    onContactStoreChanged = () => {
        this.setState({contacts: ContactStore.getContacts(1)})
    }

    render() {
        return (
            <Table striped hover>
                <thead>
                <tr>
                    <th width="5%">#</th>
                    <th width="20%">Name</th>
                    <th width="25%">Email</th>
                    <th width="15%">Phone Numbers</th>
                    <th width="25%">Description</th>
                    <th width="10%">Inbox</th>
                </tr>
                </thead>
                <tbody onScroll={this.onScrollContactList}>
                {this.renderItems()}
                </tbody>
            </Table>
        )
    }

    renderItems() {
        const {contacts} = this.state

        if (!contacts || contacts.length == 0) return ''

        compare = (c1, c2) => {
            if(c1.name > c2.name) return 1
            else if(c1.name < c2.name) return -1
            return 0
        }
        return contacts.sort(compare).map((contact, index) => (
            <tr key={contact._id}>
                <td width="5%">{index + 1}</td>
                <td width="20%">{contact.name}</td>
                <td width="25%">{contact.email}</td>
                <td width="15%">{contact.phone_numbers}</td>
                <td width="25%">{contact.description}</td>
                <td width="10%">{contact.account().name}</td>
            </tr>
        ))
    }


    onScrollContactList = (evt) => {
        const el = evt.target

        if (!ContactStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {

            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(() => {

                this.setState({contacts: ContactStore.getContacts({page: ContactStore.currentPage + 1})})

            }, 500)

            evt.preventDefault()
        }
    }

}

