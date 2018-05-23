/* global FlowRouter, subsManager */
import _ from 'underscore'
import {createContainer} from 'meteor/react-meteor-data'
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {Button, DropdownButton, MenuItem, Modal} from 'react-bootstrap'
import Spinner from '../components/utils/spinner'
import {warning} from '/imports/api/lib/alerts'
import {Actions, NylasUtils, AccountStore, ThreadStore, DraftStore, CategoryStore} from '/imports/api/nylas'
import '../../api/nylas/tasks/task-queue'
import ItemCategory from '../components/inbox/ItemCategory'
import MessageList from '../components/inbox/MessageList'
import Toolbar, {VIEW_TYPE_THREAD, VIEW_TYPE_MESSAGE} from '../components/inbox/Toolbar'
import ComposeModal from '../components/inbox/composer/ComposeModal'
import NylasSigninForm from '../components/inbox/NylasSigninForm'
import CreateSalesRecord from '../components/salesRecord/CreateSalesRecord'
import CreateProject from '../components/project/CreateProject'
import PeopleForm from '../components/people/PeopleForm'
import {People, Users, ROLES} from '/imports/api/models'
import {unbindThreadFromConversation} from '/imports/api/models/threads/methods'
import ThreadList from '../components/inbox/ThreadList'
import DraftList from '../components/inbox/DraftList'
import {ClientErrorLog} from '/imports/utils/logger'

import Utils from '../../utils/Utils'
import {Panel} from '../components/common'
import ComposeView from '../components/inbox/composer/ComposeView'
import {Threads} from "../../api/models";
import {PAGESIZE} from "../../utils/constants";


class InboxPage extends (React.Component) {
    constructor(props) {
        super(props)

        const currentCategory = CategoryStore.currentCategory
        this.state = {
            addingInbox: false,
            addingTeamInbox: false,
            showTargetForm: false,
            binding: false,
            loadingThreads: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts(),
            currentCategory,
            currentThread: currentCategory ? ThreadStore.currentThread(currentCategory) : null,
            viewType: VIEW_TYPE_THREAD,
            keyword: null,

            threadStartIndexForThreadView: 1,
            threadStartIndexForMessageView: 1,
            threadTotalCount: 0,
        }

        if (this.state.hasNylasAccounts) {
            Actions.loadContacts()
        }

    }

    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged))
        this.unsubscribes.push(CategoryStore.listen(this.onCategoryStoreChanged))
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged))
        this.unsubscribes.push(ThreadStore.listen(this.onThreadStoreChanged))


        this.fetchNewThreadsInterval = setInterval(() => {
            if (Meteor.userId()) {
                Meteor.call('thread.fetchNewThreads', {accounts: Meteor.user().nylasAccounts()}, (err) => {
                    if (err) ClientErrorLog.error(err)
                })
            }
        }, 1 * 1000 * 120)   // every 5 minutes

    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })

        if (this.fetchNewThreadsInterval) clearInterval(this.fetchNewThreadsInterval)
    }

    onAccountStoreChanged = () => {
        this.setState({
            addingInbox: false,
            addingTeamInbox: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts()
        })
    }

    onCategoryStoreChanged = () => {
        const currentCategory = CategoryStore.currentCategory
        // subsCache.subscribe('threads.params', this.threadFilter(currentCategory))

        setTimeout(() => {
            this.setState({
                currentCategory
            })
        }, 100)
    }

    onDraftStoreChanged = () => {
        this.setState({
            composeStateForModal: DraftStore.draftViewStateForModal()
        })
    }

    onThreadStoreChanged = () => {
        this.setState({
            fetching: ThreadStore.fetching
        })

        const {keyword} = this.state
        if(keyword != ThreadStore.keyword) {
            this.setState({
                keyword: ThreadStore.keyword
            })
        }
    }

    threadFilter = (category) => {
        if(!category) return {}

        const {keyword} = this.state

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
        } else if(category.name === 'unread') {
            filters['account_id'] = category.account_id
            filters['unread'] = true
        } else if(category.name === 'open') {
            filters['account_id'] = category.account_id

            if(NylasUtils.usesLabels(category.account_id)) {
                filters['labels.name'] = {$ne: 'important'}   // `all` is label for archiving on gmail
            } else {
                filters['folders.name'] = {$ne: 'archive'}
            }
        } else {
            let inboxes
            if(category.name === 'inbox') {
                inboxes = Meteor.user().nylasAccounts()
                    .find(({accountId}) => accountId === category.account_id)
                    .categories
                    .filter(c => c.name==='inbox' || c.name==='archive')
            } else if(category.id === 'not_filed') {
                const conversationThreadIds = Threads.find({conversationId:{$ne:null}}, {fields:{id:1}}).map(t => t.id)
                //filters['conversationId'] = null
                filters['id'] = {$nin:conversationThreadIds}
                inboxes = Meteor.user().nylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
            } else if(category.id === 'unassigned') {
                filters['assignee'] = {$ne:Meteor.userId()}
                inboxes = Meteor.user().nylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
            }/* else if(currentCategory.type === 'teammember') {
                inboxes = currentCategory.privateNylasAccounts().map(({categories}) => _.findWhere(categories, {name:'inbox'})).filter((inbox) => inbox!=null)
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

    threadOptions = (skip) => ({sort:{last_message_received_timestamp:-1}, skip, limit:PAGESIZE})

    render() {
        if (this.props.loading) return <Spinner visible={true}/>

        return (
            <div className="inbox-page">
                {this.renderContents()}
            </div>
        )
    }

    renderContents() {
        const {hasNylasAccounts, composeStateForModal, addingInbox, addingTeamInbox} = this.state

        if (addingInbox) {
            return <NylasSigninForm isAddingTeamInbox={addingTeamInbox}
                                    onCancel={() => this.setState({addingInbox: false})}/>
        } else {
            if (hasNylasAccounts) {
                return (
                    <div style={{height: '100%'}}>
                        {this.renderInbox()}
                        {this.renderPeopleModal()}
                        <ComposeModal isOpen={composeStateForModal && composeStateForModal.show}
                                      clientId={composeStateForModal && composeStateForModal.clientId}
                                      onClose={this.onCloseComposeModal}/>
                    </div>
                )
            } else {
                return this.renderAddInboxButtons()
            }
        }
    }

    onCloseComposeModal = () => {
        const {composeStateForModal} = this.state
        if (!composeStateForModal) return

        const draft = DraftStore.draftForClientId(composeStateForModal.clientId)
        if (!NylasUtils.isEmptyDraft(draft) && !draft.id) {
            if (confirm('Are you sure to discard?'))
                DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }

    onPrevPage = () => {
        if (this.state.viewType === VIEW_TYPE_THREAD) {
            this.setState(({threadStartIndexForThreadView}) => {
                threadStartIndexForThreadView -= PAGESIZE

                return {threadStartIndexForThreadView}
            })
        } else if (this.state.viewType === VIEW_TYPE_MESSAGE) {
            this.setState(({threadStartIndexForMessageView}) => {
                threadStartIndexForMessageView -= 1

                return {threadStartIndexForMessageView}
            }, () => {
                ThreadStore.selectThread(Threads.findOne(this.threadFilter(this.state.currentCategory), this.threadOptions(this.state.threadStartIndexForMessageView)))
            })
        }
    }
    onNextPage = () => {
        if (this.state.viewType === VIEW_TYPE_THREAD) {
            this.setState(({threadStartIndexForThreadView}) => {
                threadStartIndexForThreadView += PAGESIZE

                return {threadStartIndexForThreadView}
            })
        } else if (this.state.viewType === VIEW_TYPE_MESSAGE) {
            this.setState(({threadStartIndexForMessageView}) => {
                threadStartIndexForMessageView += 1

                return {threadStartIndexForMessageView}
            }, () => {
                ThreadStore.selectThread(Threads.findOne(this.threadFilter(this.state.currentCategory), this.threadOptions(this.state.threadStartIndexForMessageView)))
            })
        }
    }
    renderInbox() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Toolbar
                    currentUser={this.props.currentUser}
                    thread={this.state.currentThread}
                    onSelectExtraMenu={this.onSelectExtraMenu}
                    onBack={() => this.setState({viewType: VIEW_TYPE_THREAD})}
                    viewType={this.state.viewType}
                    threadStartIndex={this.state.viewType === VIEW_TYPE_THREAD ? this.state.threadStartIndexForThreadView : this.state.threadStartIndexForMessageView}
                    threadTotalCount={Threads.find(this.threadFilter(this.state.currentCategory)).count()}
                    onPrevPage={this.onPrevPage}
                    onNextPage={this.onNextPage}
                />
                {
                    this.state.viewType === VIEW_TYPE_THREAD && (
                        <div className="content-panel">
                            <div className="column-panel column-category">
                                {this.renderCategories()}
                            </div>
                            <div className="column-panel column-thread">
                                {this.state.currentCategory && this.state.currentCategory.name === 'drafts' ? this.renderDrafts() : this.renderThreads()}
                            </div>
                            {this.renderTargetForm()}
                        </div>
                    )
                }
                {
                    this.state.viewType === VIEW_TYPE_MESSAGE && (
                        <div className="content-panel">
                            <div className="column-panel column-message">
                                {this.state.currentCategory && this.state.currentCategory.name === 'drafts' ? this.renderDraftComposeView() : this.renderMessages()}
                            </div>
                            {this.renderTargetForm()}
                        </div>
                    )
                }
            </div>
        )
    }

    onSelectExtraMenu = (menu, {type, doc, _id} = {}) => {
        if (menu === 'create' || menu === 'bind') {

            this.setState({
                binding: menu === 'bind',
                targetType: type,
                selectedTarget: doc
            })

            const temp = () => {
                const {participants} = this.state.currentThread
                const noStoredParticipants = _.uniq(JSON.parse(JSON.stringify(participants.filter((p) => People.findOne({'emails.email': new RegExp(`^${p.email}$`, 'i')}) == null))), (p) => p.email)
                if (noStoredParticipants && noStoredParticipants.length) {
                    this.setState({
                        noStoredParticipants,
                        showPeopleModal: true
                    })

                    return
                }

                this.setState({
                    showTargetForm: true
                })
            }
            if (menu === 'bind') {
                subsCache.subscribe(type === 'deal' ? 'salesrecords.one' : 'projects.one', doc._id).onReady(() => {
                    temp()
                })
            } else {
                temp()
            }
        } else if (menu === 'goto') {
            FlowRouter.go(Utils.jsUcfirst(type), {id: _id})
        } else if (menu === 'unbind') {
            try {
                unbindThreadFromConversation.call({id: this.state.currentThread.id})
            } catch (err) {
                ClientErrorLog.error(err)
            }
        }
    }

    renderTargetForm() {
        const {showTargetForm, binding, currentThread, selectedTarget, targetType} = this.state

        if (!currentThread || !showTargetForm) return ''

        const title = binding ? `Bind this thread to existing ${targetType}` : `Create new ${targetType} from this thread`
        return (
            <div className="column-panel" style={{order: 4, overflowY: 'auto', height: '100%', padding: 10}}>
                <Panel title={title} actions={<i className="fa fa-arrow-right" onClick={this.hideTargetForm}/>}>
                    {
                        targetType === 'deal' &&
                        <CreateSalesRecord
                            {...this.props}
                            thread={currentThread}
                            salesRecord={selectedTarget}
                            onSaved={this.hideTargetForm}
                        />
                    }
                    {
                        targetType === 'project' &&
                        <CreateProject
                            {...this.props}
                            thread={currentThread}
                            project={selectedTarget}
                            onSaved={this.hideTargetForm}
                        />
                    }
                </Panel>
            </div>
        )
    }

    renderPeopleModal() {
        const {showPeopleModal, noStoredParticipants} = this.state

        if (!noStoredParticipants || noStoredParticipants.length == 0) return ''

        return (
            <Modal bsSize="large" show={showPeopleModal} onHide={() => {
                this.setState({showPeopleModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> Add to
                    people</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PeopleForm
                        people={noStoredParticipants}
                        onSaved={this.onSavedPeople}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onSavedPeople = () => {
        this.setState({
            showPeopleModal: false
        }, () => {
            this.setState({showTargetForm: true})
        })
    }

    hideTargetForm = () => {
        this.setState({
            showTargetForm: false,
            binding: false
        })
    }

    renderCategories() {
        const {currentCategory, fetching} = this.state

        const appCategories = [{
            id: 'assigned_to_me',
            name: 'assigned',
            display_name: 'Assigned to me'
        }, {
            id: 'following',
            name: 'following',
            display_name: 'Following'
        }, {
            id: 'not_filed',
            name: 'not_filed',
            display_name: 'Not Filed'
        }, {
            id: 'unassigned',
            name: 'unassigned',
            display_name: 'Unassigned'
        }]
        return (
            <div className="list-category">
                {this.renderAddInboxButtons(true)}
                {
                    appCategories.map((category, index) => (
                        <ItemCategory
                            key={`app-folder-${index}`}
                            category={category}
                            onClick={(evt) => {
                                this.onSelectCategory(category)
                            }}
                            selected={currentCategory && category.id == currentCategory.id}/>
                    ))
                }
                {
                    AccountStore.accounts(true).map((account) => {
                        const categoriesForAccount = CategoryStore.getCategories(account.accountId)

                        const actionEl = !account.isTeamAccount || account.isTeamAccount && Meteor.user().isAdmin() ?
                            <i className="fa fa-minus" onClick={() => this.onClickRemoveAccount(account)}></i> : ''
                        return (
                            <div key={`account-${account.accountId}`}>
                                <div className="account-wrapper">
                                    <span><img
                                        src={account.isTeamAccount ? '/icons/inbox/ic-team.png' : '/icons/inbox/ic-individual.png'}
                                        width="16px"/></span>&nbsp;
                                    <span>{account.emailAddress}</span>
                                    <span style={{flex: 1}}></span>
                                    <span className="action">{actionEl}</span>
                                </div>
                                {
                                    categoriesForAccount && categoriesForAccount.length > 0 && categoriesForAccount.map((category, index) =>
                                        <div key={`category-${index}`}>
                                            {category && <ItemCategory
                                                category={category}
                                                onClick={(evt) => {
                                                    this.onSelectCategory(category)
                                                }}
                                                selected={currentCategory && category.id == currentCategory.id}/>}
                                            {!category && ''}
                                        </div>
                                    )
                                }
                            </div>
                        )

                    })
                }
                {
                    Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) && (
                        <div>
                            <div className="account-wrapper">
                                <span><img src="/icons/inbox/ic-team.png" width="16px"/></span>&nbsp;
                                <span>Team members</span>
                                <span style={{flex: 1}}></span>
                                <span className="action"></span>
                            </div>
                            {
                                Users.find({_id: {$ne: Meteor.userId()}}).map((user, index) => {
                                    const category = Object.assign(user, {
                                        type: 'teammember',
                                        id: user._id,
                                        name: 'teammember',
                                        display_name: user.name(),
                                        unreads: 0
                                    })
                                    return (
                                        <div key={`teammember-${index}`}>
                                            <ItemCategory
                                                category={category}
                                                onClick={(evt) => {
                                                    this.onSelectCategory(category)
                                                }}
                                                selected={currentCategory && category.id == currentCategory.id}/>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
                {fetching && <div className="status-wrapper">Fetching new messages ...</div>}
            </div>
        )
    }

    renderAddInboxButtons(isSmall) {
        if (isSmall) {
            if (Meteor.user().isAdmin()) {
                return (
                    <div>
                        <DropdownButton bsStyle="primary" bsSize="small" title="Add inbox" id="dropdown-add-inbox">
                            <MenuItem onSelect={() => this.setState({
                                addingInbox: true,
                                addingTeamInbox: false
                            })}>Individual</MenuItem>
                            <MenuItem onSelect={() => this.setState({
                                addingInbox: true,
                                addingTeamInbox: true
                            })}>Team</MenuItem>
                        </DropdownButton>
                    </div>
                )
            } else {
                return (
                    <div>
                        <Button bsStyle="primary" bsSize="small" onClick={() => this.setState({addingInbox: true, addingTeamInbox: false})}>
                            Add inbox
                        </Button>
                    </div>
                )
            }
        } else {
            return (
                <div style={{textAlign: 'center'}}>
                    <Button bsStyle="primary" onClick={() => this.setState({addingInbox: true})}>Add an individual
                        inbox</Button>
                    {Meteor.user().isAdmin() &&
                    <Button bsStyle="default" style={{marginLeft: 10}}
                            onClick={() => this.setState({addingInbox: true, addingTeamInbox: true})}>Add a team
                        inbox</Button>}
                </div>
            )
        }
    }

    onClickRemoveAccount = (account) => {
        if (confirm(`Are you sure to remove ${account.emailAddress}?`)) {
            Meteor.call('removeNylasAccount', account, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message)
                }

                Actions.changedAccounts()
            })
        }
    }

    onSelectThread = (thread, index) => {
        ThreadStore.selectThread(thread)
        this.setState({
            currentThread: thread,
            viewType: VIEW_TYPE_MESSAGE,
            threadStartIndexForMessageView: this.state.threadStartIndexForThreadView + index
        })
    }

    renderThreads() {
        const {currentCategory, currentThread} = this.state

        let threads = Threads.find(this.threadFilter(currentCategory), this.threadOptions(this.state.threadStartIndexForThreadView)).fetch()
        threads = _.uniq(threads, false, ({id}) => id)

        return (
            <ThreadList
                threads={threads}
                currentThread={currentThread}
                onSelectThread={(thread) => this.onSelectThread(thread, threads.indexOf(thread))}
            />
        )
    }

    renderMessages() {
        return <MessageList/>
    }

    renderDrafts() {
        return (
            <DraftList
                category={this.state.currentCategory}
                onSelectDraft={(draft) => Actions.composeDraft({message: {...draft}})}
            />
        )
    }

    renderDraftComposeView() {

        return (
            <div>

            </div>
        )
    }

    onSelectCategory(category) {
        CategoryStore.selectCategory(category)
        this.setState({currentThread: ThreadStore.currentThread(category)})
    }
}

export default createContainer(() => {
    const subscribers = []
    subscribers.push(subsCache.subscribe('threads.all'))
    // subscribers.push(subsCache.subscribe('messages.all'))

    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true)
    }
}, InboxPage)
