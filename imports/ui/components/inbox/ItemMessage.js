import React from 'react';
import NylasUtils from '../../../api/nylas/nylas-utils';
import ItemMessageBody from './ItemMessageBody';
import MessageParticipants from './MessageParticipants';
import MessageTimestamp from './MessageTimestamp';

class ItemMessage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            detailedHeaders: false
        }
    }

    render() {
        if (this.props.collapsed) {
            return this.renderCollapsed();
        } else {
            return this.renderFull();
        }
    }

    renderCollapsed() {
        attachmentIcon = []
        if (this.props.message.files.length > 0)
            attachmentIcon = <div className="collapsed-attachment"></div>

        displayName = this.props.message.from&&this.props.message.from.length ? NylasUtils.displayName(this.props.message.from[0]) : ''
        return (
            <div className={this.props.className} onClick={this._toggleCollapsed}>
                <div className="message-item-white-wrap">
                    <div className="message-item-area">
                        <div className="collapsed-from">
                            {displayName}
                        </div>
                        <div className="collapsed-snippet">
                            {this.props.message.snippet}
                        </div>
                        <div className="collapsed-timestamp">
                            <MessageTimestamp date={this.props.message.date}/>
                        </div>
                        {attachmentIcon}
                    </div>
                </div>
            </div>
        )
    }

    renderFull() {
        return (
            <div className="message-item-wrap">
                <div className="message-item-white-wrap">
                    <div className="message-item-area">
                        {this.renderHeader()}
                        <ItemMessageBody message={this.props.message}/>
                        {this.renderAttachments()}
                    </div>
                </div>
            </div>
        )
    }

    renderHeader() {
        return (
            <div className="message-header" onClick={this.onClickHeader}>
                {this.renderFromParticipants()}
                {this.renderToParticipants()}
                {this.renderFolder()}
                {/*{this.renderHeaderDetailToggle()}*/}
            </div>
        )
    }

    onClickHeader(e) {

        if (this.state.detailedHeaders) return;

        el = e.target
        while (el !== e.currentTarget) {
            wl = ["message-header-right",
                "collapsed-participants",
                "header-toggle-control"]
            if ("message-header-right" in el.classList) return;
            if ("collapsed-participants" in el.classList) return;

            el = el.parentElement;
        }

        //this.toggleCollapsed();
    }

    renderFromParticipants() {
        return (
            <MessageParticipants
                from={this.props.message.from}
                onClick={this.onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    renderToParticipants() {
        return (
            <MessageParticipants
                to={this.props.message.to}
                cc={this.props.message.cc}
                bcc={this.props.message.bcc}
                onClick={this.onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    onClickParticipants(e) {
        el = e.target
        while (el != e.currentTarget) {
            if ("collapsed-participants" in el.classList) {
                this.setState({detailedHeaders: true});

                e.stopPropagation();
                return;
            }
            el = el.parentElement;
        }
        return;
    }

    renderFolder() {
        if (!this.state.detailedHeaders) return [];

        if (!NylasUtils.useFolder()) return;

        const folder = this.props.message.folder;

        if (!folder) return;


        return (
            <div className="header-row">
                <div className="header-label">Folder:&nbsp;</div>
                <div className="header-name">{folder.display_name}</div>
            </div>
        )
    }

    renderAttachments() {
        return;
    }
}

export default ItemMessage;
