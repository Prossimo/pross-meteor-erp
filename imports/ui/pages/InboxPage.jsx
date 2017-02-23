import React from 'react';
import Spinner from '../components/utils/spinner';
import Actions from '../../api/nylas/actions';
import FolderStore from '../../api/nylas/folder-store';
import ThreadStore from '../../api/nylas/thread-store';
import ItemFolder from '../components/inbox/ItemFolder';
import ItemThread from '../components/inbox/ItemThread';

class Inbox extends React.Component{
    constructor(props){
        super(props);

        this.onFolderStoreChanged = this.onFolderStoreChanged.bind(this);
        this.onThreadStoreChanged = this.onThreadStoreChanged.bind(this);

        this.state = {
            folders: [],
            threads: [],
            loading: true
        }

        Actions.loadFolders();
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
            loading: this.isLoading()
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
        const {loading} = this.state;
        return (
            <div className="inbox-page">
                <h2 className="page-title">Inbox page</h2>

                {loading && <Spinner visible={true}/>}
                {!loading &&
                    (<div className="content-panel">
                        <div className="column-panel" style={{order:1, minWidth:150, maxWidth:150, borderRight:'1px solid rgba(221,221,221,0.6)'}}>
                            <div className="list-folder">
                                {this.renderFolders()}
                            </div>
                        </div>
                        <div className="column-panel" style={{order:2, minWidth:250, maxWidth:450, borderRight:'1px solid rgba(221,221,221,0.6)', overflowY:'auto', height:'100%'}}>
                            <div className="list-thread">
                                {this.renderThreads()}
                            </div>
                        </div>
                            <div className="column-panel" style={{order:3, flex:1}}>View panel</div>
                    </div>)
                }
            </div>
        )
    }

    renderFolders() {
        const {folders} = this.state;

        return folders.map((folder)=><ItemFolder key={folder.id} data={folder}/>)
    }

    renderThreads() {
        const {threads} = this.state;

        return threads.map((thread)=><ItemThread key={thread.id} data={thread}/>)
    }
}

export default Inbox;