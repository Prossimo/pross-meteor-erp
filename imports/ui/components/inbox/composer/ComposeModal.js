import React from 'react'
import {Modal} from 'react-bootstrap'
import ComposeView from './ComposeView'
import DraftStore from '../../../../api/nylas/draft-store'

export default class ComposeModal extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string,
        isOpen: React.PropTypes.bool,
        onClose: React.PropTypes.func.isRequired,
        salesRecordId: React.PropTypes.string
    }

    constructor(props) {
        super(props);

        draft = DraftStore.draftForClientId(props.clientId)
    }

    render() {
        const {isOpen, clientId, onClose, salesRecordId} = this.props
        return (
            <Modal show={isOpen} onHide={onClose} bsSize="large">
                <Modal.Header closeButton><Modal.Title>{draft && draft.reply_to_message_id ? "Edit Message" : "Compose New Mail"}</Modal.Title></Modal.Header>
                <Modal.Body><ComposeView clientId={clientId} salesRecordId={salesRecordId}/></Modal.Body>
            </Modal>
        )
    }
}