import React from 'react'
import {Button, Table, InputGroup, FormControl} from 'react-bootstrap'
import ContactStore from '../../../api/nylas/contact-store'


export default class ContactsList extends React.Component {
    static propTypes = {
        onSelectContact: React.PropTypes.func
    }

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
            <div className="contact-list">
                {this.renderToolbar()}

                {this.renderContent()}
            </div>
        )
    }

    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    <Button bsStyle="primary"><i className="fa fa-user-plus"/></Button>
                </div>
                <div style={{width:250}}>
                    <InputGroup>
                        <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                        <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearch} />
                    </InputGroup>
                </div>
            </div>
        )
    }

    renderContent() {
        return (
            <div className="content-panel">
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
                    {this.renderContacts()}
                    </tbody>
                </Table>
            </div>
        )
    }
    renderContacts() {
        const {contacts} = this.state

        if (!contacts || contacts.length == 0) return ''

        compare = (c1, c2) => {
            if (c1.name > c2.name) return 1
            else if (c1.name < c2.name) return -1
            return 0
        }
        return contacts.sort(compare).map((contact, index) => (
            <tr key={contact._id} onClick={()=>{this.props.onSelectContact && this.props.onSelectContact(contact)}}>
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

            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.scrollTimeout = setTimeout(() => {

                this.setState({contacts: ContactStore.getContacts({page: ContactStore.currentPage + 1})})

            }, 500)

            evt.preventDefault()
        }
    }

    onChangeSearch = (evt) => { console.log('onChangeSearch', evt.target.value)
        if(this.searchTimeout) { clearTimeout(this.searchTimeout); }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                ContactStore.searchContacts(keyword, {limit:100}).then((contacts)=> {
                    this.setState({contacts: contacts})
                })
            } else {
                this.setState({contacts: ContactStore.getContacts()})
            }
        }, 500)
    }
}

