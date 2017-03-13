import React from 'react'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'

export default class Toolbar extends React.Component {
    static propTypes = {
        thread: React.PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        const thread = this.props.thread
        return (
            <div className="toolbar-container">
                <div style={{order:0, minWidth:150, maxWidth:200, flex:1}}><ComposeButton/></div>
                <div style={{order:1, minWidth:250, maxWidth:450, flex:1}}></div>
                <div style={{order:2, flex:1}}>
                    <ThreadArchiveButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton thread={thread}/>
                </div>
            </div>
        )
    }
}