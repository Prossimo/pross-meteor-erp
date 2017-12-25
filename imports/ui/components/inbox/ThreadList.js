import _ from 'underscore'
import React, {PropTypes} from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Threads} from '/imports/api/models'
import {NylasUtils, ThreadStore, Actions} from '/imports/api/nylas'
import ItemThread from './ItemThread'

const LIMIT = 100
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
            currentThread: ThreadStore.currentThread(category),
            keyword: null
        }

        this.page = 1
    }

    componentDidMount() {
        this.unsubscribe = ThreadStore.listen(this.onThreadStoreChanged)

        //const options = {skip:(this.page-1)*LIMIT, limit:LIMIT}
        //this.subscriptions = [subsManager.subscribe('threads.params', this.filter(), _.extend(options,this.sort()))]
        subsCache.subscribe('threads.params', this.filter())

    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe()
        //this.subscriptions.forEach(subscription => subscription.stop())
    }

    componentWillReceiveProps(newProps) {
        if(newProps.category && (!this.props.category || newProps.category.id != this.props.category.id)) {
            this.setState({
                category:newProps.category,
                currentThread: ThreadStore.currentThread(newProps.category)
            }, () => {
                subsCache.subscribe('threads.params', this.filter())
            })
        }
    }

    sort = () => ({sort:{last_message_received_timestamp:-1}})

    filter = () => {
        const {category, keyword} = this.state

        if(!category) return {}

        const filters = {}
        let keywordQuery, inboxQuery

        if(keyword && keyword.length) {
            const regx = {$regex: keyword, $options: 'i'}
            keywordQuery = [{
                'participants.email': regx
            },{
                'participants.name': regx
            },{
                subject: regx
            },{
                snippet: regx
            }]
        }

        if(category.id === 'assigned_to_me') {
            filters['assignee'] = Meteor.userId()
        } else if(category.id === 'following') {
            filters['followers'] = Meteor.userId()
        } else if(category.type === 'teammember') {
            filters['assignee'] = category.id
        } else {
            let inboxes
            if(category.id === 'not_filed') {
                const conversationThreadIds = Threads.find({conversationIds:{$ne:null}}, {fields:{id:1}}).map(t => t.id)
                //filters['conversationId'] = null
                filters['id'] = {$nin:conversationThreadIds}
                inboxes = Meteor.user().nylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
            } else if(category.id === 'unassigned') {
                filters['assignee'] = {$ne:Meteor.userId()}
                inboxes = Meteor.user().nylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
            }/* else if(category.type === 'teammember') {
                inboxes = category.privateNylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
            }*/ else {
                inboxes = [category]
            }

            inboxQuery = inboxes.map((inbox) => {
                if(NylasUtils.usesLabels(inbox.account_id)) {
                    return {'labels.id': inbox.id}
                } else {
                    return {'folders.id': inbox.id}
                }
            })
        }

        if(keywordQuery && inboxQuery) {
            filters['$and'] = [{'$or':keywordQuery}, {'$or':inboxQuery}]
        } else if(keywordQuery && !inboxQuery) {
            filters['$or'] = keywordQuery
        } else if(!keywordQuery && inboxQuery) {
            filters['$or'] = inboxQuery
        }

        return filters
    }
    onThreadStoreChanged = () => {
        const {category, currentThread} = this.state
        const newCurrentThread = ThreadStore.currentThread(category)
        if(!_.isEqual(currentThread, newCurrentThread)) {
            this.setState({
                currentThread: newCurrentThread
            })
        }

        const {keyword} = this.state
        if(keyword != ThreadStore.keyword) {
            this.setState({
                keyword: ThreadStore.keyword
            })
        }

    }

    onSelectThread = (thread) => {
        if(this.props.onSelectThread) this.props.onSelectThread(thread)

        ThreadStore.selectThread(thread)
    }

    render() {
        const {category, currentThread, loading} = this.state
        if(!category) return <div>Please select any folder</div>

        //console.log('render ThreadList', keyword)


        let threads = Threads.find(this.filter(), this.sort()).fetch()
        threads = _.uniq(threads, false, ({id}) => id)
        return (
            <div className="column-panel" style={{
                overflowY: 'auto',
                height: '100%'
            }} onScroll={this.onScrollThreadList}>
                <div className="list-thread">
                {
                    threads.map((thread, index) => <ItemThread key={`thread-${index}`} thread={thread}
                                                        onClick={(evt) => this.onSelectThread(thread)}
                                                        selected={currentThread && thread.id == currentThread.id}/>)

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