import _ from 'underscore'
import React from 'react';
import {Button} from 'react-bootstrap';
import Spinner from '../components/utils/spinner';
import Actions from '../../api/nylas/actions';
import TaskQueue from '../../api/nylas/tasks/task-queue';
import NylasUtils from '../../api/nylas/nylas-utils';
import AccountStore from '../../api/nylas/account-store';
import CategoryStore from '../../api/nylas/category-store';
import ThreadStore from '../../api/nylas/thread-store';
import DraftStore from '../../api/nylas/draft-store';
import ItemCategory from '../components/inbox/ItemCategory';
import ItemThread from '../components/inbox/ItemThread';
import MessageList from '../components/inbox/MessageList';
import Toolbar from '../components/inbox/Toolbar';
import ComposeModal from '../components/inbox/composer/ComposeModal';
import {ADMIN_ROLE_LIST} from '../../api/constants/roles';
import NylasSigninForm from '../components/inbox/NylasSigninForm';


class InboxPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAddingInbox: false,
            isAddingTeamInbox: false,
            threads: [],
            loadingThreads: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts(),
            selectedCategory: null,
            selectedThread: null
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
            isAddingInbox: false,
            isAddingTeamInbox: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts()
        })
    }

    onCategoryStoreChanged = () => {
        this.setState({
            selectedCategory: CategoryStore.getSelectedCategory(),
            threads: ThreadStore.getThreads(CategoryStore.getSelectedCategory()),
        })
    }

    onThreadStoreChanged = () => {
        this.setState({
            threads: ThreadStore.getThreads(CategoryStore.getSelectedCategory()),
            loadingThreads: ThreadStore.loading
        })
    }

    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    render() {
        const {hasNylasAccounts, composeState, isAddingInbox, isAddingTeamInbox} = this.state;
        if (isAddingInbox) {
            return (
                <div className="inbox-page">
                    <NylasSigninForm isAddingTeamInbox={isAddingTeamInbox}
                                     onCancel={() => this.setState({isAddingInbox: false})}/>
                </div>
            )
        } else {
            return (
                <div className="inbox-page">
                    {hasNylasAccounts && this.renderInbox()}
                    {!hasNylasAccounts && (
                        <div style={{textAlign: 'center'}}>
                            <Button bsStyle="primary" onClick={() => this.setState({isAddingInbox: true})}>Add an
                                individual inbox</Button>
                            {Roles.userIsInRole(this.props.currentUser._id, [...ADMIN_ROLE_LIST]) &&
                            <Button bsStyle="default" style={{marginLeft: 10}}
                                    onClick={() => this.setState({isAddingInbox: true, isAddingTeamInbox: true})}>Add a
                                team inbox</Button>}
                        </div>
                    )}
                    <ComposeModal isOpen={composeState && composeState.show}
                                  clientId={composeState && composeState.clientId} onClose={this.onCloseComposeModal}/>
                </div>
            )
        }

    }

    onCloseComposeModal = () => {
        const {composeState} = this.state
        if (!composeState) return

        const draft = DraftStore.draftForClientId(composeState.clientId)

        if (!NylasUtils.isEmptyDraft(draft) && confirm('Are you sure to discard?')) {
            DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }

    renderInbox() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Toolbar currentUser={this.props.currentUser} thread={this.state.selectedThread}
                         onSelectAddInbox={(isAddingTeamInbox) => this.setState({
                             isAddingInbox: true,
                             isAddingTeamInbox: isAddingTeamInbox
                         })}/>

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


    renderCategories() {
        const {selectedCategory} = this.state;

        return (
            <div className="list-category">
                {
                    AccountStore.accounts().map((account) => {
                        const categoriesForAccount = CategoryStore.getCategories(account.accountId)
                        console.log('categoriesForAccount', categoriesForAccount)
                        return (
                            <ul key={account.accountId}>
                                <div className="account-wrapper">
                                    <span><img
                                        src={account.isTeamAccount ? "/icons/inbox/ic-team.png" : "/icons/inbox/ic-individual.png"}
                                        width="16px"/></span>&nbsp;
                                    <span>{account.emailAddress}</span>
                                </div>
                                {
                                    categoriesForAccount && categoriesForAccount.length > 0 && categoriesForAccount.map((category) =>
                                        <ItemCategory
                                            key={category.id}
                                            category={category}
                                            onClick={(evt) => {
                                                this.onCategorySelected(category)
                                            }}
                                            selected={selectedCategory && category.id == selectedCategory.id}
                                        />)
                                }
                            </ul>
                        )

                    })
                }
            </div>
        )
    }

    renderThreads() {
        const {threads, selectedThread, loadingThreads} = this.state;

        return (
            <div className="list-thread">
                {
                    threads.map((thread) => <ItemThread key={thread.id} thread={thread}
                                                        onClick={(evt) => this.onThreadSelected(thread)}
                                                        selected={selectedThread && thread.id == selectedThread.id}/>)

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
        this.setState({selectedThread: thread});

        ThreadStore.selectThread(thread);
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if (!this.state.loadingThreads && !ThreadStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            Actions.loadThreads(CategoryStore.getSelectedCategory(), {page: ThreadStore.currentPage + 1})
        }
    }
}

export default InboxPage;