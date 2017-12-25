import React from 'react'
import {Button} from 'react-bootstrap'
import Actions from '../../../../api/nylas/actions'

export default class ComposeButton extends React.Component {
    static displayName = 'ComposeButton';

    static propTypes = {
        conversationId: React.PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    _onNewCompose = () => {
        const {conversationId} = this.props
        Actions.composeNew({conversationIds:conversationId ? [conversationId] : null})
    }

    render() {
        return (
            <Button onClick={this._onNewCompose}>
                <img src="/icons/inbox/toolbar-compose.png" width="50%"/>
            </Button>


        )
    }
}
