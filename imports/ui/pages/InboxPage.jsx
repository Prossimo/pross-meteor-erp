import React from 'react';
import Spinner from '../components/utils/spinner';
import Actions from '../../api/nylas/actions';
import FolderStore from '../../api/nylas/folder-store';
import ThreadStore from '../../api/nylas/thread-store';
import ItemFolder from '../components/inbox/ItemFolder';
import ItemThread from '../components/inbox/ItemThread';
import MessageList from '../components/inbox/MessageList';

class Inbox extends React.Component{
    constructor(props){
        super(props);

        this.onFolderStoreChanged = this.onFolderStoreChanged.bind(this);
        this.onThreadStoreChanged = this.onThreadStoreChanged.bind(this);

        this.state = {
            folders: [],
            threads: [],
            loading: true,
            hasNylasInfo: Meteor.user().nylas!=null,
            selectedFolder: null,
            selectedThread: null
        }

        if(this.state.hasNylasInfo) {
            Actions.loadFolders();
        }
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(FolderStore.listen(this.onFolderStoreChanged));
        this.unsubscribes.push(ThreadStore.listen(this.onThreadStoreChanged));
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe)=>{unsubscribe()});
    }

    onFolderStoreChanged() {
        this.setState({
            folders: FolderStore.getData(),
            loading: this.isLoading(),
            selectedFolder: FolderStore.getSelectedFolder()
        })
    }

    onThreadStoreChanged() {
        this.setState({
            threads: ThreadStore.getData(),
            loading: this.isLoading()
        })
    }

    isLoading() {
        return FolderStore.isLoading() && ThreadStore.isLoading();
    }

    render() {
        const {hasNylasInfo} = this.state;
        return (
            <div className="inbox-page">
                <h2 className="header-panel">Inbox page</h2>
                {hasNylasInfo && this.renderInbox()}
                {!hasNylasInfo && (<div>Could not get inbox data!</div>)}
            </div>
        )
    }

    renderInbox() {
        const {loading}  = this.state;
        if(loading) {
            return <Spinner visible={true}/>
        } else {
            return (<div className="content-panel">
                <div className="column-panel" style={{order:1, minWidth:150, maxWidth:150, borderRight:'1px solid rgba(221,221,221,0.6)', paddingRight:5}}>
                    <div className="list-folder">
                        {this.renderFolders()}
                    </div>
                </div>
                <div className="column-panel" style={{order:2, minWidth:250, maxWidth:450, borderRight:'1px solid rgba(221,221,221,0.6)', overflowY:'auto', height:'100%'}}>
                    <div className="list-thread">
                        {this.renderThreads()}
                    </div>
                </div>
                <div className="column-panel" style={{order:3, flex:1, overflowY:'auto', height:'100%'}}>
                    {this.renderMessages()}
                </div>
            </div>)
        }
    }
    renderFolders() {
        const {folders, selectedFolder} = this.state;

        return folders.map((folder)=><ItemFolder key={folder.id} folder={folder} onClick={(evt)=>{this.onFolderSelected(folder)}} selected={selectedFolder && folder.id==selectedFolder.id}/>)
    }

    renderThreads() {
        const {threads, selectedThread} = this.state;

        return threads.map((thread)=><ItemThread key={thread.id} thread={thread} onClick={(evt)=>this.onThreadSelected(thread)} selected={selectedThread && thread.id==selectedThread.id}/>)
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
}

export default Inbox;