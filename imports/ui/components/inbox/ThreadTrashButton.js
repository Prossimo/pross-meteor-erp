import React from 'react'
import {Button} from 'react-bootstrap'
import Actions from '../../../api/nylas/actions'
import NylasUtils from '../../../api/nylas/nylas-utils'
import TaskFactory from '../../../api/nylas/tasks/task-factory'

export default class ThreadTrashButton extends React.Component {
    static displayName = 'ThreadTrashButton';

    static propTypes = {
        thread: React.PropTypes.object
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

        const tasks = TaskFactory.tasksForMovingToTrash({threads: [this.props.thread]})

        Actions.queueTasks(tasks)
        //Actions.popSheet()
        e.stopPropagation()
    }

}
