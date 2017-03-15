import React from 'react';
import Spinner from '../components/utils/spinner';
import Actions from '../../api/nylas/actions';
import TaskQueue from '../../api/nylas/tasks/task-queue';
import NylasUtils from '../../api/nylas/nylas-utils';
import FolderStore from '../../api/nylas/folder-store';
import ThreadStore from '../../api/nylas/thread-store';
import DraftStore from '../../api/nylas/draft-store';
import ItemFolder from '../components/inbox/ItemFolder';
import ItemThread from '../components/inbox/ItemThread';
import MessageList from '../components/inbox/MessageList';
import Toolbar from '../components/inbox/Toolbar';
import ComposeModal from '../components/inbox/composer/ComposeModal';

class Inbox extends React.Component {
    constructor(props) {
        super(props);

        this.onFolderStoreChanged = this.onFolderStoreChanged.bind(this);
        this.onThreadStoreChanged = this.onThreadStoreChanged.bind(this);

        this.state = {
            folders: [],
            threads: [],
            loadingFolders: false,
            loadingThreads: false,
            hasNylasInfo: Meteor.user().nylas != null,
            selectedFolder: null,
            selectedThread: null
        }


        if (this.state.hasNylasInfo) {
            Actions.loadContacts();
            Actions.loadFolders();
        }
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(FolderStore.listen(this.onFolderStoreChanged));
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

    onFolderStoreChanged() {
        this.setState({
            folders: FolderStore.getFolders(),
            loadingFolders: FolderStore.loading,
            selectedFolder: FolderStore.getSelectedFolder()
        })
    }

    onThreadStoreChanged() {
        const selectedFolder = FolderStore.getSelectedFolder()
        this.setState({
            threads: ThreadStore.getThreads(selectedFolder&&selectedFolder.id),
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
                <Toolbar />
                {hasNylasInfo && this.renderInbox()}
                {!hasNylasInfo && (<div>Could not get inbox data!</div>)}
                <ComposeModal isOpen={composeState && composeState.show} clientId={composeState && composeState.clientId} onClose={this.onCloseComposeModal} />
            </div>
        )
    }

    onCloseComposeModal = () => {
        const {composeState} = this.state
        if(!composeState) return

        const draft = DraftStore.draftForClientId(composeState.clientId)

        if(!NylasUtils.isEmptyDraft(draft) && confirm('Are you sure to discard?')) {
            DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }

    renderInbox() {
        const {loadingFolders}  = this.state;
        if (loadingFolders) {
            return <Spinner visible={true}/>
        } else {
            return (<div className="content-panel">
                <div className="column-panel" style={{
                    order: 1,
                    minWidth: 150,
                    maxWidth: 200,
                    borderRight: '1px solid rgba(221,221,221,0.6)',
                    paddingRight: 5
                }}>
                    {this.renderFolders()}
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
            </div>)
        }
    }

    renderFolders() {
        const {folders, selectedFolder} = this.state;
        console.log('Folders', folders)
        return (
            <div className="list-folder">
                {
                    folders.map((folder) => <ItemFolder
                        key={folder.id}
                        folder={folder}
                        onClick={(evt) => { this.onFolderSelected(folder) }}
                        selected={selectedFolder && folder.id == selectedFolder.id}
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
                {loadingThreads && <div style={{position:'relative', height:44, width:'100%'}}><Spinner visible={true} /></div>}
            </div>
        )
    }

    renderMessages() {
        return <MessageList />
    }

    onFolderSelected(folder) {
        console.log("Folder selected", folder);
        this.setState({selectedFolder: folder});

        FolderStore.selectFolder(folder);
    }

    onThreadSelected(thread) {
        console.log('Thread selected', thread);
        this.setState({selectedThread: thread});

        ThreadStore.selectThread(thread);
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if(!this.state.loadingThreads && !ThreadStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            Actions.loadThreads(FolderStore.getSelectedFolder(), {page:ThreadStore.currentPage+1})
        }
    }
}

export default Inbox;