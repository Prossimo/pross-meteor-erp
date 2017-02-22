import React from 'react';

class Inbox extends React.Component{
    constructor(props){
        super(props);

    }

    render() {

        return (
            <div className="inbox-page">
                <h2 className="page-title">Inbox page</h2>
                <div className="content-panel">
                    <div className="column-panel" style={{order:1, minWidth:150, maxWidth:150, borderRight:'1px solid rgba(221,221,221,0.6)'}}>
                        <div style={{position:'relative',display:'flex',flexDirection:'column',height:'100%'}}>
                        Folder panel
                        </div>
                    </div>
                    <div className="column-panel" style={{order:2, minWidth:250, maxWidth:450, borderRight:'1px solid rgba(221,221,221,0.6)'}}>Thread panel</div>
                    <div className="column-panel" style={{order:3, flex:1}}>View panel</div>
                </div>
            </div>
        )
    }
}

export default Inbox;