import React, {PropTypes} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {ThreadStore, Actions} from '/imports/api/nylas'
import ItemThread from './ItemThread'
import Threads from "../../../api/models/threads/threads";
import _ from "underscore";

class ThreadList extends TrackerReact(React.Component) {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            page: 1
        }
    }

    onSelectThread = (thread) => {
        if(this.props.onSelectThread) this.props.onSelectThread(thread)
    }

    render() {
        const {loading} = this.state

        return (
            <div className="column-panel" style={{
                overflowY: 'auto',
                height: '100%'
            }}>
                <div className="list-thread">
                {
                    this.props.threads.map((thread, index) =>
                        <ItemThread
                            key={`thread-${index}`}
                            thread={thread}
                            onClick={(evt) => this.onSelectThread(thread)}
                            selected={this.props.currentThread && thread.id == this.props.currentThread.id}
                            onChangeStatus={checked => this.props.onChangeThreadStatus(thread, checked)}
                        />)
                }
                {loading && <div style={{position: 'relative', height: 44, width: '100%'}}><Spinner visible={true}/></div>}
                </div>
            </div>
        )
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if (el.scrollTop + el.clientHeight == el.scrollHeight) {
            this.page ++
            //const options = {skip:(this.page-1)*LIMIT, limit:LIMIT}
            //this.subscriptions.push(subsManager.subscribe('threads.params', this.filter(), _.extend(options,this.sort())))

            console.log('loadOldThreads')
            Actions.loadThreads(null, {page: ThreadStore.currentPage + 1})
        }
    }
}

ThreadList.propTypes = {
    currentThread: PropTypes.object,
    threads: PropTypes.array,
    onSelectThread: PropTypes.func,
    onChangeThreadStatus: PropTypes.func,
    threadFilter: PropTypes.func,
    threadOptions: PropTypes.func
}


export default createContainer((props) => {
    let threads = Threads.find(props.threadFilter(), props.threadOptions()).fetch()
    threads = _.uniq(threads, false, ({id}) => id)

    return {
        loading: !subsCache.subscribe('threads.all'),
        threads
    }
}, ThreadList)
