import React from 'react';
import Spinner from '../components/utils/spinner';
import Actions from '../../api/nylas/actions';
import TaskQueue from '../../api/nylas/tasks/task-queue';
import NylasUtils from '../../api/nylas/nylas-utils';
import CategoryStore from '../../api/nylas/category-store';
import ThreadStore from '../../api/nylas/thread-store';
import DraftStore from '../../api/nylas/draft-store';
import ItemCategory from '../components/inbox/ItemCategory';
import ItemThread from '../components/inbox/ItemThread';
import MessageList from '../components/inbox/MessageList';
import Toolbar from '../components/inbox/Toolbar';
import ComposeModal from '../components/inbox/composer/ComposeModal';

class Inbox extends React.Component {
    constructor(props) {
        super(props);

        this.onCategoryStoreChanged = this.onCategoryStoreChanged.bind(this);
        this.onThreadStoreChanged = this.onThreadStoreChanged.bind(this);

        this.state = {
            categories: [],
            threads: [],
            loadingCategories: false,
            loadingThreads: false,
            hasNylasInfo: Meteor.user().nylas != null,
            selectedCategory: null,
            selectedThread: null
        }


        if (this.state.hasNylasInfo) {
            Actions.loadContacts();
            Actions.loadCategories();
        }
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(CategoryStore.listen(this.onCategoryStoreChanged));
        this.unsubscribes.push(ThreadStore.listen(this.onThreadStoreChanged));
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged));

        //window.addEventListener("scroll", this.onWindowScroll);
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });

        //window.removeEventListener("scroll", this.onWindowScroll);
    }

    onCategoryStoreChanged() {
        this.setState({
            categories: CategoryStore.getCategories(),
            loadingCategories: CategoryStore.loading,
            selectedCategory: CategoryStore.getSelectedCategory()
        })
    }

    onThreadStoreChanged() {
        const selectedCategory = CategoryStore.getSelectedCategory()
        this.setState({
            threads: ThreadStore.getThreads(selectedCategory && selectedCategory.id),
            loadingThreads: ThreadStore.loading
        })
    }

    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    render() {
        const {hasNylasInfo, composeState} = this.state;
        return (
            <div className="inbox-page">
                {hasNylasInfo && this.renderInbox()}
                {!hasNylasInfo && (<div>Could not get inbox data!</div>)}
                <ComposeModal isOpen={composeState && composeState.show}
                              clientId={composeState && composeState.clientId} onClose={this.onCloseComposeModal}/>
            </div>
        )
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
        const {loadingCategories} = this.state;
        if (loadingCategories) {
            return <Spinner visible={true}/>
        } else {
            return (
                <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                    <Toolbar thread={this.state.selectedThread}/>

                    <div className="content-panel">
                        <div className="column-panel" style={{
                            order: 1,
                            minWidth: 150,
                            maxWidth: 200,
                            borderRight: '1px solid rgba(221,221,221,0.6)',
                            paddingRight: 5
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
    }

    renderCategories() {
        const {categories, selectedCategory} = this.state;

        return (
            <div className="list-category">
                {
                    categories.map((category) => <ItemCategory
                        key={category.id}
                        category={category}
                        onClick={(evt) => {
                            this.onCategorySelected(category)
                        }}
                        selected={selectedCategory && category.id == selectedCategory.id}
                    />)
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
        this.setState({selectedCategory: category});

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

export default Inbox;