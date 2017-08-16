import React from 'react'
import {Button} from 'react-bootstrap'
import Actions from '../../../../api/nylas/actions'

export default class ComposeButton extends React.Component {
    static displayName = 'ComposeButton';

    static propTypes = {
        salesRecordId: React.PropTypes.string,
        conversationId: React.PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    _onNewCompose = () => {
        const {salesRecordId, conversationId} = this.props
        Actions.composeNew({salesRecordId, conversationId})
    }

    render() {
        return (
            <Button onClick={this._onNewCompose}>
                <img src="/icons/inbox/toolbar-compose.png" width="50%"/>
            </Button>


        )
    }
}
