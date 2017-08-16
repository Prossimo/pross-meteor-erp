import React from 'react'
import {Button} from 'react-bootstrap'
import Actions from '../../../api/nylas/actions'
import NylasUtils from '../../../api/nylas/nylas-utils'
import TaskFactory from '../../../api/nylas/tasks/task-factory'

export default class ThreadArchiveButton extends React.Component {
    static displayName = 'ThreadArchiveButton';

    static propTypes = {
        thread: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onArchive = this._onArchive.bind(this)
    }
    render() {
        if(!NylasUtils.canArchiveThreads()) return <span />

        return (
            <Button onClick={this._onArchive} disabled={!this.props.thread}>
                <img src="/icons/inbox/toolbar-archive.png" width="50%"/>
            </Button>
        )
    }

    _onArchive = (e) => {
        if(!this.props.thread) return

        const tasks = TaskFactory.tasksForArchiving({threads: [this.props.thread]})

        Actions.queueTasks(tasks)
        //Actions.popSheet()
        e.stopPropagation()
    }

}
