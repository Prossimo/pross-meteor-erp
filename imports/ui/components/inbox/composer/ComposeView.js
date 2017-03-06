import React from 'react'
import ReactQuill from 'react-quill'
import SendActionButton from './SendActionButton'
import NylasUtils from '../../../../api/nylas/nylas-utils'
import DraftStore from '../../../../api/nylas/draft-store'
import ContactStore from '../../../../api/nylas/contact-store'
import {FormInput, FormIconField} from 'elemental'
import {Creatable, Select} from 'react-select'


export default class ComposeView extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string
    }

    constructor(props) {
        super(props)

        this.state = this._getStateFromDraftStore()

        this.state.contacts = this._getContacts()
        this.state.expandedCc = false
        this.state.expandedBcc = false
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(ContactStore.listen(this._onContactStoreChanged));
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });
    }

    _onContactStoreChanged() {
        this.setState({contacts: this._getContacts()})
    }

    _getContacts() {
        const contacts = ContactStore.getAllContacts()

        return contacts.map((c) => {
            return {value: c.email, label: NylasUtils.contactDisplayFullname(c), name: c.name}
        })
    }

    _getStateFromDraftStore() {
        let draft = _.clone(DraftStore.draftForClientId(this.props.clientId))

        draft.to = draft.to && draft.to.map((c) => {
            return {value: c.email, label: NylasUtils.contactDisplayFullname(c), name: c.name}
        })
        draft.cc = draft.cc && draft.cc.map((c) => {
            return {value: c.email, label: NylasUtils.contactDisplayFullname(c), name: c.name}
        })
        draft.bcc = draft.bcc && draft.bcc.map((c) => {
            return {value: c.email, label: NylasUtils.contactDisplayFullname(c), name: c.name}
        })

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
        const {to, cc, bcc, contacts, expandedCc, expandedBcc} = this.state


        const ccSelector = (
            <div className="input-wrap">
                <label className="participant-label">Cc:</label>
                <Creatable
                    className="select-wrap"
                    multi
                    value={cc}
                    onChange={this._onChangeCc}
                    options={contacts}
                    clearable={false}
                />
            </div>
        )

        const bccSelector = (
            <div className="input-wrap">
                <label className="participant-label">Bcc:</label>
                <Creatable
                    className="select-wrap"
                    multi
                    value={bcc}
                    onChange={this._onChangeBcc}
                    options={contacts}
                    clearable={false}
                />
            </div>
        )

        return (
            <div>
                <div className="input-wrap">
                    <label className="participant-label">To:</label>
                    <Creatable
                        className="select-wrap"
                        multi
                        value={to}
                        onChange={this._onChangeTo}
                        options={contacts}
                        clearable={false}
                    />
                    <div className="composer-header-actions">
                        {!expandedCc && <div className="action" onClick={this._onClickCc}>Cc</div>}
                        {!expandedBcc && <div className="action" onClick={this._onClickBcc}>Bcc</div>}
                    </div>
                </div>
                {expandedCc && ccSelector}
                {expandedBcc && bccSelector}
                <div className="input-wrap"><FormInput type="text" placeholder="Subject" onChange={this._onChangeSubject}/></div>
            </div>
        )
    }

    _renderEditor() {
        return (
            <div>
                <ReactQuill placeholder="Write here..."
                            value={this.state.body}
                            theme="snow"
                            onChange={this._onChangeBody}/>
            </div>
        )
    }

    _renderActions() {
        return (
            <div className="composer-action-bar-wrap">
                <div className="composer-action-bar-content">
                    <SendActionButton/>
                </div>
            </div>
        )
    }

    _onChangeSubject = (e) => {
        subject = e.target.value
        this.setState({subject: subject})
        this._changeDraftStore({subject: subject})
    }
    _onChangeBody = (text) => {
        this.setState({body: text})
        this._changeDraftStore({body: text})
    }

    _onChangeTo = (items) => {console.log('_onChangeTo', items)
        this.setState({to: items})

        this._changeDraftStore({to:items&&items.map((item)=>{return {email:item.value,name:item.name}})})
    }

    _onChangeCc = (items) => {
        this.setState({cc: items})

        this._changeDraftStore({cc:items&&items.map((item)=>{return {email:item.value,name:item.name}})})
    }

    _onChangeBcc = (items) => {
        this.setState({bcc: items})

        this._changeDraftStore({bcc:items&&items.map((item)=>{return {email:item.value,name:item.name}})})
    }

    _onClickCc = (e) => {
        this.setState({expandedCc: true})
    }

    _onClickBcc = (e) => {
        this.setState({expandedBcc: true})
    }
}