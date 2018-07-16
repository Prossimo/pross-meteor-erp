import React, {PropTypes} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {ThreadStore, Actions} from '/imports/api/nylas'
import Spinner from '/imports/ui/components/utils/spinner'
import ItemThread from './ItemThread'
import Threads from '../../../api/models/threads/threads'
import {countThreads} from '/imports/api/models/threads/methods'
import _ from 'underscore'

class ThreadList extends TrackerReact(React.Component) {
    constructor(props) {
        super(props)

        this.state = { page: 1 }
    }

    onSelectThread = (thread) => {
        if(this.props.onSelectThread) this.props.onSelectThread(thread)
    }

    render() {
        const { loading } = this.props
        if (loading) return (<Spinner visible={true}/>)
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
    threadFilter: PropTypes.object,
    threadOptions: PropTypes.object
}


export default createContainer((props) => {
  const { threadFilter, threadOptions } = props
  const subscribers = []
  subscribers.push(subsCache.subscribe('threads.custom', threadFilter, threadOptions))

  let threads = Threads.find(threadFilter, threadOptions).fetch()

  threads = _.uniq(threads, false, ({id}) => id)

  return {
    loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
    threads,
  }
}, ThreadList)
