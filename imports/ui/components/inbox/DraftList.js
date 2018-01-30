import _ from 'underscore'
import React, {PropTypes} from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {NylasUtils, DraftsStore, Actions} from '/imports/api/nylas'
import {Messages} from '/imports/api/models'
import ItemDraft from './ItemDraft'

const LIMIT = 100
export default class DraftList extends TrackerReact(React.Component) {
    static propTypes = {
        category: PropTypes.object,
        onSelectDraft: PropTypes.func
    }

    constructor(props) {
        super(props)

        const {category} = props
        this.state = {
            category,
            loading: false,
            currentDraft: DraftsStore.currentDraft(category),
            keyword: null
        }

        this.page = 1
    }

    componentDidMount() {
        this.unsubscribe = DraftsStore.listen(this.onDraftsStoreChanged)

       subsCache.subscribe('messages.params', this.filter())
    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe()
    }

    componentWillReceiveProps(newProps) {
        if(newProps.category && (!this.props.category || newProps.category.id != this.props.category.id)) {
            this.setState({
                category:newProps.category,
                currentDraft: DraftsStore.currentDraft(newProps.category)
            }, () => {
                subsCache.subscribe('messages.params', this.filter())
            })
        }
    }

    sort = () => ({sort:{date:-1}})

    filter = () => {
        const {category, keyword} = this.state

        if(!category) return {}

        let filters = {}
        let keywordQuery

       if(keyword && keyword.length) {
            const regx = {$regex: keyword, $options: 'i'}
            keywordQuery = [{
                'to.email': regx
            },{
                'to.name': regx
            },{
                subject: regx
            },{
                snippet: regx
            }]
        }

        const draftQuery = {
            object: 'draft',
           account_id: category.account_id
        }

        if(keywordQuery) {
            filters['$and'] = [{'$or':keywordQuery}, draftQuery]
        } else {
            filters = draftQuery
        }

        return filters
    }

   onDraftsStoreChanged = () => {
        const {category, currentDraft} = this.state
        const newCurrentDraft = DraftsStore.currentDraft(category)
        if(!_.isEqual(currentDraft, newCurrentDraft)) {
            this.setState({
                currentDraft: newCurrentDraft
            })
        }

        const {keyword} = this.state
        if(keyword != DraftsStore.keyword) {
            this.setState({
                keyword: DraftsStore.keyword
            })
        }

    }

    onSelectDraft = (draft) => {
        if(this.props.onSelectDraft) this.props.onSelectDraft(draft)

        DraftsStore.selectDraft(draft)
    }

    render() {
        const {category, currentDraft, loading} = this.state
        if(!category) return <div>Please select drafts folder</div>

        //console.log('render ThreadList', keyword)


        let drafts = Messages.find(this.filter(), this.sort()).fetch()
       drafts = _.uniq(drafts, false, ({id}) => id)
        return (
            <div className="column-panel" style={{
                overflowY: 'auto',
                height: '100%'
            }} onScroll={this.onScrollDraftList}>
                <div className="list-thread">
                {
                    drafts.map((draft, index) => <ItemDraft key={`draft-${index}`} draft={draft}
                                                        onClick={(evt) => this.onSelectDraft(draft)}
                                                        selected={currentDraft && draft.id == currentDraft.id}/>)

                }
                {loading && <div style={{position: 'relative', height: 44, width: '100%'}}><Spinner visible={true}/></div>}
                </div>
            </div>
        )
    }

    onScrollDraftList = (evt) => {
        const el = evt.target

        if (el.scrollTop + el.clientHeight == el.scrollHeight) {
            this.page ++
            //const options = {skip:(this.page-1)*LIMIT, limit:LIMIT}
            //this.subscriptions.push(subsManager.subscribe('threads.params', this.filter(), _.extend(options,this.sort())))

            console.log('loadOldDrafts')
            Actions.loadDrafts(null, {page: DraftsStore.currentPage + 1})
        }
    }
}