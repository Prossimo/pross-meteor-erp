import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'react-bootstrap'
import Actions from '../../../api/nylas/actions'
import NylasUtils from '../../../api/nylas/nylas-utils'
import TaskFactory from '../../../api/nylas/tasks/task-factory'

export default class ThreadTrashButton extends React.Component {
    static displayName = 'ThreadTrashButton';

    static propTypes = {
        thread: PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onRemove = this._onRemove.bind(this)
    }
    render() {
        if (!NylasUtils.canTrashThreads()) return <span />

        return (
            <Button onClick={this._onRemove} disabled={!this.props.thread}>
                <img src="/icons/inbox/toolbar-trash.png" width="50%"/>
            </Button>
        )
    }

    _onRemove = (e) => {
        if(!this.props.thread) return

        Actions.queueTasks(TaskFactory.tasksForMovingToTrash({threads: [this.props.thread]}))
        Meteor.call('thread.remove', {id: this.props.thread.id})
        //Actions.popSheet()
        e.stopPropagation()
    }

}
