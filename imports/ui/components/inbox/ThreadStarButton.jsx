import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'react-bootstrap'
import Actions from '/imports/api/nylas/actions'
import NylasUtils from '/imports/api/nylas/nylas-utils'

export default class ThreadStarButton extends React.Component {
    static displayName = 'ThreadStarButton';

    static propTypes = {
        thread: PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onStarToggle = this._onStarToggle.bind(this)
    }
    render() {
        const selected = this.props.thread && this.props.thread.selected

        return (
            <Button onClick={this._onStarToggle} disabled={!this.props.thread}>
                <img src={`/icons/inbox/toolbar-star${selected?'-selected':''}.png`} width="50%"/>
            </Button>
        )
    }

    _onStarToggle = (e) => {
        /*task = new ChangeStarredTask({
         thread: @props.thread
         starred: !@props.thread.starred
         })
         Actions.queueTask(task)
         e.stopPropagation()*/
    }

}
