import React from 'react';

class Inbox extends React.Component{
    constructor(props){
        super(props);

    }

    render() {

        return (
            <div className="page-container admin-page">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">Inbox page</h2>

                    </div>
                </div>
                <aside className="right-sidebar">
                    <h2 className="title">Inbox</h2>

                </aside>
            </div>
        )
    }
}

export default Inbox;