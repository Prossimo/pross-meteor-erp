import _ from 'underscore'
import React from 'react'
import ReactQuill from 'react-quill'
import SendActionButton from './SendActionButton'
import NylasUtils from '../../../../api/nylas/nylas-utils'
import DraftStore from '../../../../api/nylas/draft-store'

import {FormControl} from 'react-bootstrap'
import ParticipantsInputField from './ParticipantsInputField'


export default class ComposeView extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string
    }

    constructor(props) {
        super(props)

        this.state = {
            draft: this._getDraftFromStore(),
            expandedCc: false,
            expandedBcc: false
        }
    }

    componentDidMount() {
        this.unsubscribes = [];
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });
    }


    _getDraftFromStore() {
        let draft = _.clone(DraftStore.draftForClientId(this.props.clientId))


        return draft
    }


    _changeDraftStore(data={}) {
        DraftStore.changeDraftForClientId(this.props.clientId, data)
    }
    render() {
        return (
            <div className="composer-inner-wrap">
                {this._renderHeader()}
                {this._renderEditor()}
                {this._renderActions()}
            </div>
        )
    }

    _renderHeader() {
        const {draft, expandedCc, expandedBcc} = this.state

        const {to, cc, bcc, subject} = draft

        const ccSelector = (
            <ParticipantsInputField label="Cc" contacts={cc} onChange={this._onChangeCc}/>
        )

        const bccSelector = (
            <ParticipantsInputField label="Bcc" contacts={bcc} onChange={this._onChangeBcc}/>
        )

        return (
            <div>
                <div className="input-wrap">
                    <ParticipantsInputField label="To" contacts={to} onChange={this._onChangeTo}/>
                    <div className="composer-header-actions">
                        {!expandedCc && <div className="action" onClick={this._onClickCc}>Cc</div>}
                        {!expandedBcc && <div className="action" onClick={this._onClickBcc}>Bcc</div>}
                    </div>
                </div>

                {expandedCc && ccSelector}
                {expandedBcc && bccSelector}

                <div className="input-wrap">
                    <FormControl type="text" value={subject} placeholder="Subject" onChange={this._onChangeSubject}/>
                </div>
            </div>
        )
    }

    _renderEditor() {
        return (
            <div>
                <ReactQuill placeholder="Write here..."
                            value={this.state.draft?this.state.draft.body:""}
                            theme="snow"
                            onChange={this._onChangeBody}/>
            </div>
        )
    }

    _renderActions() {
        return (
            <div className="composer-action-bar-wrap">
                <div className="composer-action-bar-content">
                    <SendActionButton draft={this.state.draft} disabled={this._isUnableToSend} isValidDraft={this._isValidDraft}/>
                </div>
            </div>
        )
    }

    _onChangeSubject = (e) => {
        subject = e.target.value

        this._changeDraftStore({subject: subject})

        this.setState({draft:this._getDraftFromStore()})
    }
    _onChangeBody = (text) => {
        this._changeDraftStore({body: text})

        this.setState({draft:this._getDraftFromStore()})
    }

    _onChangeTo = (contacts) => {
        this._changeDraftStore({to:contacts})

        this.setState({draft:this._getDraftFromStore()})
    }

    _onChangeCc = (contacts) => {
        this._changeDraftStore({cc:contacts})

        this.setState({draft:this._getDraftFromStore()})
    }

    _onChangeBcc = (contacts) => {
        this._changeDraftStore({bcc:contacts})

        this.setState({draft:this._getDraftFromStore()})
    }

    _onClickCc = (e) => {
        this.setState({expandedCc: true})
    }

    _onClickBcc = (e) => {
        this.setState({expandedBcc: true})
    }

    _isUnableToSend = () => {
        return !this.state.draft || !this.state.draft.to || this.state.draft.to.length==0
    }


    _isValidDraft = (options = {}) => {
        if (DraftStore.isSendingDraft(this.props.clientId)) {
            return false;
        }

        if(!this.state.draft) return false

        const {to, cc, bcc, subject, body, files, uploads} = this.state.draft;
        const allRecipients = [].concat(to, cc, bcc);
        let dealbreaker = null;


        for (const contact of allRecipients) {
            if (!NylasUtils.isValidContact(contact)) {
                dealbreaker = `${contact.email} is not a valid email address - please remove or edit it before sending.`
            }
        }
        if (allRecipients.length === 0) {
            dealbreaker = 'You need to provide one or more recipients before sending the message.';
        }

        if (dealbreaker) {
            return alert(dealbreaker);
        }

        const bodyIsEmpty = !body || body.length==0
        const forwarded = NylasUtils.isForwardedMessage({subject, body});
        const hasAttachment = (files || []).length > 0 || (uploads || []).length > 0;

        let warnings = [];

        if (subject.length === 0) {
            warnings.push('without a subject line');
        }

        if (this._mentionsAttachment(body) && !hasAttachment) {
            warnings.push('without an attachment');
        }

        if (bodyIsEmpty && !forwarded && !hasAttachment) {
            warnings.push('without a body');
        }

        if ((warnings.length > 0) && (!options.force)) {
            if (confirm(`Send ${warnings.join(' and ')}?`)) {
                return this._isValidDraft({force: true});
            }
            return false;
        }

        return true;

    }
    _mentionsAttachment = (body) => {
        /*let cleaned = QuotedHTMLTransformer.removeQuotedHTML(body.toLowerCase().trim());
        const signatureIndex = cleaned.indexOf('<signature>');
        if (signatureIndex !== -1) {
            cleaned = cleaned.substr(0, signatureIndex - 1);
        }
        return (cleaned.indexOf("attach") >= 0);*/
        return false
    }

}