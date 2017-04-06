import React from 'react'
import {Button} from 'react-bootstrap'


export default class ContactOverview extends React.Component {
    static propTypes = {
        contact: React.PropTypes.object,
        onRemoveContact: React.PropTypes.func,
        onEditContact: React.PropTypes.func
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="contact-overview">
                {this.renderToolbar()}
                {this.renderContent()}
            </div>
        )
    }


    renderToolbar() {
        const contact = this.props.contact
        const account = contact ? contact.account() : null
        const disabled = !contact || account && !Meteor.user().isAdmin() && account.isTeamAccount
        return (
            <div className="toolbar-panel">
                <div>
                    <Button bsStyle="default" disabled={disabled} onClick={this.onClickEditContact}><i className="fa fa-edit"/></Button>&nbsp;
                    <Button bsStyle="danger" disabled={disabled} onClick={this.onClickRemoveContact}><i className="fa fa-trash"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        const {contact} = this.props

        if (!contact) return null
        return (
            <div style={{marginTop:20}}>
                <div className="thumbnail-view">
                    <div className="picture"></div>
                    <div className="title">{contact.name}</div>
                    <div className="info">
                        <div><label>Email:</label><span>{contact.email}</span></div>
                        {contact.phone_numbers && contact.phone_numbers.length>0 &&
                        <div><label>Phone:</label><span>{contact.phone_numbers}</span></div>}
                        {contact.description && <div><span>{contact.description}</span></div>}
                    </div>
                </div>
            </div>
        )
    }

    onClickEditContact = () => {
        const contact = this.props.contact
        this.props.onEditContact && this.props.onEditContact(contact)
    }

    onClickRemoveContact = () => {
        const contact = this.props.contact
        this.props.onRemoveContact && this.props.onRemoveContact(contact)
    }

}

