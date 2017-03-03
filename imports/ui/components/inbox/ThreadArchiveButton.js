import React from 'react';
import Actions from '../../../api/nylas/actions';
import NylasUtils from '../../../api/nylas/nylas-utils';

export default class ThreadArchiveButton extends React.Component {
    static displayName = 'ThreadArchiveButton';

    static propTypes = {
        thread: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this._onArchive = this._onArchive.bind(this)
    }
    render() {
        canArchiveThreads = NylasUtils.canArchiveThreads()
        if (!canArchiveThreads) return <span />

        return (
            <button className="btn1 btn-toolbar btn-archive"
                    style={{order: -107}}
                    title="Archive"
                    onClick={this._onArchive}>
                <img src="/icons/inbox/toolbar-archive.png" width="50%"/>
            </button>
        )
    }

    _onArchive = (e) => {
        /*return unless DOMUtils.nodeIsVisible(e.currentTarget)
         tasks = TaskFactory.tasksForArchiving
         threads: [@props.thread]
         Actions.queueTasks(tasks)
         Actions.popSheet()
         e.stopPropagation()*/
    }

}
