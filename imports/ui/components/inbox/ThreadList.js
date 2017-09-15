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
            currentThread: ThreadStore.currentThread(category),
            keyword: null
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
        const {category, currentThread, loading, keyword} = this.state
        if(!category) return <div>Please select any folder</div>

        //console.log('render ThreadList', keyword)
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
                filters['conversationId'] = null
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

        //console.log(JSON.stringify(filters), JSON.stringify({sort:{last_message_received_timestamp:-1}}))
        let threads = Threads.find(filters, {sort:{last_message_received_timestamp:-1}}).fetch()
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