import _ from 'underscore'
import React, {PropTypes} from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Threads} from '/imports/api/models'
import {NylasUtils, ThreadStore} from '/imports/api/nylas'
import ItemThread from './ItemThread'

export default class ThreadList extends TrackerReact(React.Component) {
    static propTypes = {
        category: PropTypes.object,
        onSelectThread: PropTypes.func
    }

    constructor(props) {
        super(props)

        const {category} = props
        this.state = {
            category,
            loading: false,
            currentThread: ThreadStore.currentThread(category)
        }
    }

    componentDidMount() {
        this.unsubscribe = ThreadStore.listen(this.onThreadStoreChanged)

    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe()

    }

    componentWillReceiveProps(newProps) {
        if(newProps.category && (!this.props.category || newProps.category.id != this.props.category.id)) {
            this.setState({
                category:newProps.category,
                currentThread: ThreadStore.currentThread(newProps.category)
            })
        }
    }

    onThreadStoreChanged = () => {
        const {category, currentThread} = this.state
        const newCurrentThread = ThreadStore.currentThread(category)
        if(!_.isEqual(currentThread, newCurrentThread)) {
            this.setState({
                currentThread: newCurrentThread
            })
        }
    }

    onSelectThread = (thread) => {
        if(this.props.onSelectThread) this.props.onSelectThread(thread)

        ThreadStore.selectThread(thread)
    }
    render() {//console.log('render ThreadList')
        const {category, currentThread, loading} = this.state
        if(!category) return <div>Please select any folder</div>

        let threads
        if(NylasUtils.usesLabels(category.account_id)) {
            threads = Threads.find({'labels.id':category.id}).fetch()
        } else {
            threads = Threads.find({'folders.id':category.id}).fetch()
        }

        threads = _.uniq(threads, false, ({id}) => id)
        return (
            <div className="list-thread">
                {
                    threads.map((thread, index) => <ItemThread key={`thread-${index}`} thread={thread}
                                                        onClick={(evt) => this.onSelectThread(thread)}
                                                        selected={currentThread && thread.id == currentThread.id}/>)

                }
                {loading && <div style={{position: 'relative', height: 44, width: '100%'}}><Spinner visible={true}/></div>}
            </div>
        )
    }
}