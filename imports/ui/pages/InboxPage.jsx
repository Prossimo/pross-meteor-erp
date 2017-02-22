import React from 'react';
import Actions from '../../api/nylas/actions';
import FolderStore from '../../api/nylas/folder-store';
import LabelStore from '../../api/nylas/label-store';
import ItemFolder from '../components/inbox/ItemFolder';
import ItemLabel from '../components/inbox/ItemLabel';

class Inbox extends React.Component{
    constructor(props){
        super(props);

        this.onFolderStoreChanged = this.onFolderStoreChanged.bind(this);
        this.onLabelStoreChanged = this.onLabelStoreChanged.bind(this);

        const provider = Meteor.user().nylas.provider;
        this.state = {
            provider: provider,
            folders: [],
            labels: []
        }

        provider == 'gmail' ? Actions.loadLabels() : Actions.loadFolders();

    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(FolderStore.listen(this.onFolderStoreChanged));
        this.unsubscribes.push(LabelStore.listen(this.onLabelStoreChanged));
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe)=>{unsubscribe()});
    }

    onFolderStoreChanged() {
        this.setState({
            folders: FolderStore.getData()
        })
    }

    onLabelStoreChanged() {
        this.setState({
            labels: LabelStore.getData()
        })
    }

    render() {
        const {provider} = this.state;
        return (
            <div className="inbox-page">
                <h2 className="page-title">Inbox page</h2>
                <div className="content-panel">
                    <div className="column-panel" style={{order:1, minWidth:150, maxWidth:150, borderRight:'1px solid rgba(221,221,221,0.6)'}}>
                        <div style={{position:'relative',display:'flex',flexDirection:'column',height:'100%'}}>
                            {provider == 'gmail' ? this.renderLabels() : this.renderFolders()}
                        </div>
                    </div>
                    <div className="column-panel" style={{order:2, minWidth:250, maxWidth:450, borderRight:'1px solid rgba(221,221,221,0.6)'}}>Thread panel</div>
                    <div className="column-panel" style={{order:3, flex:1}}>View panel</div>
                </div>
            </div>
        )
    }

    renderLabels() {
        const {labels} = this.state;

        return labels.map((label)=><ItemLabel key={label.id} data={label}/>)
    }
    renderFolders() {
        const {folders} = this.state;

        return folders.map((folder)=><ItemFolder key={folder.id} data={folder}/>)
    }
}

export default Inbox;