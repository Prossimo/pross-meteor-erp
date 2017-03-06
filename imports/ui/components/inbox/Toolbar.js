import React from 'react'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'

export default class Toolbar extends React.Component {
    static propTypes = {

    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="toolbar-container">
                <div style={{order:0, minWidth:150, maxWidth:200, flex:1}}><ComposeButton/></div>
                <div style={{order:1, minWidth:250, maxWidth:450, flex:1}}></div>
                <div style={{order:2, flex:1}}>
                    <ThreadArchiveButton/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton/>
                </div>
            </div>
        )
    }
}