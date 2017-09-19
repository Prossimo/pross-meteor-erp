/* global FlowRouter, subsManager */
import _ from 'underscore'

import { createContainer  } from 'meteor/react-meteor-data'
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {Button, DropdownButton, MenuItem, Modal} from 'react-bootstrap'
import Spinner from '../components/utils/spinner'
import {warning} from '/imports/api/lib/alerts'
import {Actions, NylasUtils, AccountStore, CategoryStore, ThreadStore, DraftStore} from '/imports/api/nylas'
import '../../api/nylas/tasks/task-queue'
import ItemCategory from '../components/inbox/ItemCategory'
import MessageList from '../components/inbox/MessageList'
import Toolbar from '../components/inbox/Toolbar'
import ComposeModal from '../components/inbox/composer/ComposeModal'
import NylasSigninForm from '../components/inbox/NylasSigninForm'
import CreateSalesRecord from '../components/salesRecord/CreateSalesRecord'
import CreateProject from '../components/project/CreateProject'
import PeopleForm from '../components/people/PeopleForm'
import {People, Users, ROLES} from '/imports/api/models'
import {unbindThreadFromConversation} from '/imports/api/models/threads/methods'
import ThreadList from '../components/inbox/ThreadList'


class InboxPage extends (React.Component) {
    constructor(props) {
        super(props)

        const currentCategory = CategoryStore.currentCategory
        this.state = {
            addingInbox: false,
            addingTeamInbox: false,
            showTargetModal: false,
            binding: false,
            loadingThreads: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts(),
            currentCategory,
            currentThread: currentCategory ? ThreadStore.currentThread(currentCategory) : null
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

    }

    componentWillUnmount() { console.log('InboxPage compnentWillUnmount')
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })
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
        this.setState({
            currentCategory
        })
    }
    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }
    onThreadStoreChanged = () => {
        this.setState({
            fetching: ThreadStore.fetching
        })
    }

    render() {
        if(this.props.loading) return <Spinner visible={true}/>

        return (
            <div className="inbox-page">
                {this.renderContents()}
            </div>
        )
    }

    renderContents() {
        const {hasNylasAccounts, composeState, addingInbox, addingTeamInbox} = this.state

        if (addingInbox) {
            return <NylasSigninForm isAddingTeamInbox={addingTeamInbox}
                                    onCancel={() => this.setState({addingInbox: false})}/>
        } else {
            if (hasNylasAccounts) {
                return (
                    <div style={{height: '100%'}}>
                        {this.renderInbox()}
                        {this.renderTargetModal()}
                        {this.renderPeopleModal()}
                        <ComposeModal isOpen={composeState && composeState.show}
                                      clientId={composeState && composeState.clientId}
                                      onClose={this.onCloseComposeModal}/>
                    </div>
                )
            } else {
                return this.renderAddInboxButtons()
            }
        }
    }

    onCloseComposeModal = () => {
        const {composeState} = this.state
        if (!composeState) return

        const draft = DraftStore.draftForClientId(composeState.clientId)

        if (!NylasUtils.isEmptyDraft(draft)) {
            if (confirm('Are you sure to discard?'))
                DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }

    renderInbox() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Toolbar currentUser={this.props.currentUser} thread={this.state.currentThread}
                         onSelectExtraMenu={this.onSelectExtraMenu}/>

                <div className="content-panel">
                    <div className="column-panel" style={{
                        order: 1,
                        minWidth: 250,
                        maxWidth: 250,
                        borderRight: '1px solid rgba(221,221,221,0.6)',
                        paddingRight: 5,
                        overflowY: 'auto',
                        height: '100%'
                    }}>
                        {this.renderCategories()}
                    </div>
                    <div className="column-panel" style={{
                        order: 2,
                        minWidth: 250,
                        maxWidth: 450,
                        borderRight: '1px solid rgba(221,221,221,0.6)',
                        overflowY: 'auto',
                        height: '100%'
                    }} onScroll={this.onScrollThreadList}>
                        {this.renderThreads()}
                    </div>
                    <div className="column-panel" style={{order: 3, flex: 1, overflowY: 'auto', height: '100%'}}>
                        {this.renderMessages()}
                    </div>
                </div>
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

            const {participants} = this.state.currentThread
            const noStoredParticipants = JSON.parse(JSON.stringify(participants.filter((p) => People.findOne({'emails.email': p.email}) == null)))
            if (noStoredParticipants && noStoredParticipants.length) {
                this.setState({
                    noStoredParticipants,
                    showPeopleModal: true
                })

                return
            }

            this.setState({
                showTargetModal: true
            })
        } else if (menu === 'goto') {
            FlowRouter.go(type, {id: _id})
        } else if (menu === 'unbind') {
            try {
                unbindThreadFromConversation.call({id: this.state.currentThread.id})
            } catch (err) {
                console.error(err)
            }
        }
    }

    renderTargetModal() {
        const {showTargetModal, binding, currentThread, selectedTarget, targetType} = this.state

        if (!currentThread) return ''

        const title = binding ? `Bind this thread to existing ${targetType}` : `Create new ${targetType} from this thread`
        return (
            <Modal show={showTargetModal} onHide={this.onCloseTargetModal} bsSize="large">
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        targetType === 'deal' &&
                        <CreateSalesRecord
                            {...this.props}
                            thread={currentThread}
                            salesRecord={selectedTarget} />
                    }
                    {
                        targetType === 'project' &&
                        <CreateProject
                            {...this.props}
                            thread={currentThread}
                            project={selectedTarget} />
                    }
                </Modal.Body>
            </Modal>
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
            this.setState({showTargetModal: true})
        })
    }

    onCloseTargetModal = () => {
        this.setState({
            showTargetModal: false,
            binding: false
        })
    }

    renderCategories() {
        const {currentCategory, fetching} = this.state

        const appCategories = [{
            id: 'assigned_to_me',
            name: 'assigned',
            display_name: 'Assigned to me'
        },{
            id: 'following',
            name: 'following',
            display_name: 'Following'
        },{
            id: 'not_filed',
            name: 'not_filed',
            display_name: 'Not Filed'
        },{
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
                    AccountStore.accounts().map((account) => {
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
                            Users.find({_id:{$ne:Meteor.userId()}}).fetch().filter(user => {
                                /*const nylasAccounts = user.privateNylasAccounts()
                                return nylasAccounts && nylasAccounts.length>0*/
                                const assignedThreads = user.assignedThreads()
                                return assignedThreads && assignedThreads.length>0
                            }).map((user, index) => {
                                const category = Object.assign(user, {
                                    type:'teammember',
                                    id:user._id,
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
                            <MenuItem onSelect={() => this.setState({addingInbox: true, addingTeamInbox: false})}>Individual</MenuItem>
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
                        <Button bsStyle="primary" bsSize="small"
                                onClick={() => this.setState({addingInbox: true, addingTeamInbox: false})}>Add
                            inbox</Button>
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

    renderThreads() {
        const {currentCategory} = this.state
        return (
            <ThreadList category={currentCategory} onSelectThread={(thread) => {
                this.setState({currentThread:thread})
            }}/>
        )
    }

    renderMessages() {
        return <MessageList/>
    }

    onSelectCategory(category) {
        CategoryStore.selectCategory(category)
        this.setState({currentThread: ThreadStore.currentThread(category)})
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if (!this.state.loadingThreads && !ThreadStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            Actions.loadThreads(CategoryStore.currentCategory, {page: ThreadStore.currentPage + 1})
        }
    }
}

export default createContainer(() => {
    const subscribers = []
    subscribers.push(subsManager.subscribe('threads.all'))
    subscribers.push(subsManager.subscribe('messages.all'))

    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true)
    }
}, InboxPage)
