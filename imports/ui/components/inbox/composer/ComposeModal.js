import React from 'react'
import {Modal} from 'react-bootstrap'
import ComposeView from './ComposeView'

export default class ComposeModal extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string,
        isOpen: React.PropTypes.bool,
        onClose: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);


    }

    render() {
        const {isOpen, clientId, onClose} = this.props
        return (
            <Modal show={isOpen} onHide={onClose} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Compose New Mail</Modal.Title></Modal.Header>
                <Modal.Body><ComposeView clientId={clientId}/></Modal.Body>
            </Modal>
        )
    }
}