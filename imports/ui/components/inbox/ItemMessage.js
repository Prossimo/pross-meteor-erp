import React from 'react';
import classNames from 'classnames';
import Actions from '../../../api/nylas/actions';
import NylasUtils from '../../../api/nylas/nylas-utils';
import ItemMessageBody from './ItemMessageBody';
import MessageParticipants from './MessageParticipants';
import MessageTimestamp from './MessageTimestamp';
import MessageControls from './MessageControls';



class ItemMessage extends React.Component {

    constructor(props) {
        super(props);

        this.bindMethods();

        this.state = {
            detailedHeaders: false
        }

    }

    bindMethods() {
        this._onClickParticipants = this._onClickParticipants.bind(this);
        this._onClickHeader = this._onClickHeader.bind(this);
        this._toggleCollapsed = this._toggleCollapsed.bind(this);
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

        displayName = this.props.message.from && this.props.message.from.length ? NylasUtils.contactDisplayName(this.props.message.from[0]) : ''
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
            <div className={this.props.className}>
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
        classes = classNames({
            "message-header": true,
            "pending": this.props.pending
        });
        return (
            <header className={classes} onClick={this._onClickHeader}>
                {this.renderHeaderSideItems()}
                <div className="message-header-right">
                    <MessageTimestamp className="message-time"
                                      isDetailed={this.state.detailedHeaders}
                                      date={this.props.message.date}/>

                    <MessageControls thread={this.props.thread} message={this.props.message}/>
                </div>
                {this.renderFromParticipants()}
                {this.renderToParticipants()}
                {this.renderFolder()}
                {this.renderHeaderDetailToggle()}
            </header>
        )
    }

    renderHeaderSideItems() {
        styles = {
            position: "absolute",
            marginTop: -2
        }
        return (
            <div className="pending-spinner" style={styles}>
                <img src="/icons/inbox/sending-spinner.gif" />
            </div>
        )
    }

    renderFromParticipants() {
        return (
            <MessageParticipants
                from={this.props.message.from}
                onClick={this._onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    renderToParticipants() {
        return (
            <MessageParticipants
                to={this.props.message.to}
                cc={this.props.message.cc}
                bcc={this.props.message.bcc}
                onClick={this._onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    renderFolder() {
        if (!this.state.detailedHeaders) return [];

        if (!NylasUtils.usesFolders(this.props.message.account_id)) return;

        const folder = this.props.message.folder;

        if (!folder) return;


        return (
            <div className="header-row">
                <div className="header-label">Folder:&nbsp;</div>
                <div className="header-name">{folder.display_name}</div>
            </div>
        )
    }

    renderHeaderDetailToggle() {
        if (this.props.pending) return null;

        if (this.state.detailedHeaders)
            return (
                <div className="header-toggle-control"
                     style={{top: "18px", left: "-14px"}}
                     onClick={ (e) => {
                         this.setState({detailedHeaders: false});
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle-active.png" style={{width: "50%"}}/>
                </div>
            )
        else
            return (
                <div className="header-toggle-control inactive"
                     style={{top: "18px"}}
                     onClick={ (e) => {
                         this.setState({detailedHeaders: true});
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle.png" style={{width: "50%"}}/>
                </div>
            )
    }

    renderAttachments() {
        return (
            <div></div>
        );
    }

    _onClickParticipants(e) {
        console.log('_onClickParticipants');
        el = e.target
        while (el != e.currentTarget) {
            if (el.classList.contains("collapsed-participants")) {
                this.setState({detailedHeaders: true});

                e.stopPropagation();
                return;
            }
            el = el.parentElement;
        }
        return;
    }

    _onClickHeader(e) {
        console.log('_onClickHeader');

        if (this.state.detailedHeaders) return;

        el = e.target
        while (el !== e.currentTarget) {
            wl = ["message-header-right",
                "collapsed-participants",
                "header-toggle-control"]
            if (el.classList.contains("message-header-right")) return;
            if (el.classList.contains("collapsed-participants")) return;

            el = el.parentElement;
        }

        this._toggleCollapsed();
    }

    _toggleCollapsed() {
        console.log("asdfasf", this.props.isLastMsg)
        if (this.props.isLastMsg) return;
        Actions.toggleMessageExpanded(this.props.message.id)
    }

}

export default ItemMessage;
