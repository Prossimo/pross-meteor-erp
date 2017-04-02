import React from 'react';
import {Button, DropdownButton, MenuItem, Modal} from 'react-bootstrap';
import Spinner from '../components/utils/spinner';
import {warning} from "/imports/api/lib/alerts";
import Actions from '../../api/nylas/actions';
import '../../api/nylas/tasks/task-queue';
import Contacts from '../../api/models/contacts/contacts';
import NylasUtils from '../../api/nylas/nylas-utils';
import AccountStore from '../../api/nylas/account-store';
import CategoryStore from '../../api/nylas/category-store';
import ThreadStore from '../../api/nylas/thread-store';
import MessageStore from '../../api/nylas/message-store';
import DraftStore from '../../api/nylas/draft-store';
import ItemCategory from '../components/inbox/ItemCategory';
import ItemThread from '../components/inbox/ItemThread';
import MessageList from '../components/inbox/MessageList';
import Toolbar from '../components/inbox/Toolbar';
import ComposeModal from '../components/inbox/composer/ComposeModal';
import NylasSigninForm from '../components/inbox/NylasSigninForm';
import CreateSalesRecord from '../components/admin/CreateSalesRecord';


class InboxPage extends React.Component {
    constructor(props) {
        super(props);

        const currentCategory = CategoryStore.currentCategory
        this.state = {
            addingInbox: false,
            addingTeamInbox: false,
            salesRecordModal: false,
            bindingSalesRecord: false,
            loadingThreads: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts(),
            currentCategory: currentCategory,
            threads: currentCategory ? ThreadStore.getThreads(currentCategory) : [],
            currentThread: ThreadStore.currentThread
        }


        if (this.state.hasNylasAccounts) {
            Actions.loadContacts();
        }
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged));
        this.unsubscribes.push(CategoryStore.listen(this.onCategoryStoreChanged));
        this.unsubscribes.push(ThreadStore.listen(this.onThreadStoreChanged));
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged));

    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });

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
            currentCategory: currentCategory,
            threads: ThreadStore.getThreads(currentCategory),
        })
    }

    onThreadStoreChanged = () => {
        this.setState({
            threads: ThreadStore.getThreads(CategoryStore.currentCategory),
            loadingThreads: ThreadStore.loading
        })
    }

    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    render() {
        return (
            <div className="inbox-page">
                {this.renderContents()}
            </div>
        )
    }

    renderContents() {
        const {hasNylasAccounts, composeState, addingInbox, addingTeamInbox} = this.state;

        if (addingInbox) {
            return <NylasSigninForm isAddingTeamInbox={addingTeamInbox}
                                    onCancel={() => this.setState({addingInbox: false})}/>
        } else {
            if (hasNylasAccounts) {
                return (
                    <div style={{height: '100%'}}>
                        {this.renderInbox()}
                        {this.renderSalesRecordModal()}
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
                         onSelectMenuSalesRecord={this.onSelectMenuSalesRecord}/>

                <div className="content-panel">
                    <div className="column-panel" style={{
                        order: 1,
                        minWidth: 150,
                        maxWidth: 200,
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

    onSelectMenuSalesRecord = (option) => {
        this.setState({
            salesRecordModal: true,
            bindingSalesRecord: option == 'bind'
        })
    }

    renderSalesRecordModal() {
        const {salesRecordModal, bindingSalesRecord, currentThread} = this.state

        if (!currentThread) return ''


        const filter = {
            account_id: currentThread.account_id,
            email: {
                $in: _.pluck(_.uniq(currentThread.participants, 'email'), 'email')
            }
        }

        const contacts = _.uniq(Contacts.find(filter).fetch(), 'email')
        console.log(JSON.stringify(filter), contacts)
        const title = bindingSalesRecord ? 'Bind this thread to existing SalesRecord' : 'Create new SalesRecord from this thread'
        return (
            <Modal show={salesRecordModal} onHide={this.onCloseSalesRecordModal} bsSize="large">
                <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CreateSalesRecord
                        {...this.props}
                        contacts={contacts}
                        subject={currentThread.subject}
                        messages={MessageStore.messages()}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onCloseSalesRecordModal = () => {
        this.setState({
            salesRecordModal: false,
            bindingSalesRecord: false
        })
    }

    renderCategories() {
        const {currentCategory} = this.state;

        return (
            <div className="list-category">
                {this.renderAddInboxButtons(true)}
                {
                    AccountStore.accounts().map((account) => {
                        const categoriesForAccount = CategoryStore.getCategories(account.accountId)

                        const actionEl = !account.isTeamAccount || account.isTeamAccount && Meteor.user().isAdmin() ?
                            <i className="fa fa-minus" onClick={() => this.onClickRemoveAccount(account)}></i> : ''
                        return (
                            <div key={account.accountId}>
                                <div className="account-wrapper">
                    <span><img
                        src={account.isTeamAccount ? "/icons/inbox/ic-team.png" : "/icons/inbox/ic-individual.png"}
                        width="16px"/></span>&nbsp;
                                    <span>{account.emailAddress}</span>
                                    <span style={{flex: 1}}></span>
                                    <span className="action">{actionEl}</span>
                                </div>
                                {
                                    categoriesForAccount && categoriesForAccount.length > 0 && categoriesForAccount.map((category) => {
                                        if (category) {
                                            return <ItemCategory
                                                key={category.id}
                                                category={category}
                                                onClick={(evt) => {
                                                    this.onCategorySelected(category)
                                                }}
                                                selected={currentCategory && category.id == currentCategory.id}
                                            />
                                        } else {
                                            return <div></div>
                                        }
                                    })
                                }
                            </div>
                        )

                    })
                }
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
                    return warning(err.message);
                }

                Actions.changedAccounts()
            })
        }
    }

    renderThreads() {
        const {threads, currentThread, loadingThreads} = this.state;

        return (
            <div className="list-thread">
                {
                    threads.map((thread) => <ItemThread key={thread.id} thread={thread}
                                                        onClick={(evt) => this.onThreadSelected(thread)}
                                                        selected={currentThread && thread.id == currentThread.id}/>)

                }
                {loadingThreads &&
                <div style={{position: 'relative', height: 44, width: '100%'}}><Spinner visible={true}/></div>}
            </div>
        )
    }

    renderMessages() {
        return <MessageList />
    }

    onCategorySelected(category) {
        CategoryStore.selectCategory(category);
    }

    onThreadSelected(thread) {
        this.setState({currentThread: thread});

        ThreadStore.selectThread(thread);
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if (!this.state.loadingThreads && !ThreadStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            Actions.loadThreads(CategoryStore.currentCategory, {page: ThreadStore.currentPage + 1})
        }
    }
}

export default InboxPage;