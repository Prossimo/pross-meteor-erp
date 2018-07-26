import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'react-bootstrap'
import Actions from '/imports/api/nylas/actions'

export default class ComposeButton extends React.Component {
    static displayName = 'ComposeButton';

    static propTypes = {
        conversationId: PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    _onNewCompose = () => {
        const {conversationId} = this.props
        Actions.composeNew({conversationId})
    }

    render() {
        return (
            <Button onClick={this._onNewCompose}>
                <img src="/icons/inbox/toolbar-compose.png" width="50%"/>
            </Button>


        )
    }
}
