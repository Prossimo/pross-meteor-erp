import React from 'react';
import Actions from '../../../../api/nylas/actions';

export default class ComposeButton extends React.Component {
    static displayName = 'ComposeButton';

    static propTypes = {
        dealId: React.PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    _onNewCompose = () => {
        Actions.composeNew(this.props.dealId)
    }

    render() {
        return (
            <button
                className="btn1 btn-toolbar item-compose"
                title="Compose new message"
                onClick={this._onNewCompose}>
                <img src="/icons/inbox/toolbar-compose.png" width="50%"/>
            </button>


        );
    }
}
