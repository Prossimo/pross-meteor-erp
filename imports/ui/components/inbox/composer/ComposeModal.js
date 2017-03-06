import React from 'react'
import {Modal, ModalHeader, ModalBody} from 'elemental'
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
            <Modal isOpen={isOpen} onCancel={onClose} backdropClosesModal width="large">
                <ModalHeader text='Compose New Mail' showCloseButton onClose={onClose}/>
                <ModalBody><ComposeView clientId={clientId}/></ModalBody>
            </Modal>
        )
    }
}