import React from 'react'
import {Button} from 'react-bootstrap'


export default class CompanyOverview extends React.Component {
    static propTypes = {
        company: React.PropTypes.object,
        onRemoveCompany: React.PropTypes.func,
        onEditCompany: React.PropTypes.func
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="company-overview">
                {this.renderToolbar()}
                {this.renderContent()}
            </div>
        )
    }


    renderToolbar() {
        const company = this.props.company
        const account = company ? company.account() : null

        const disabled = !company || account && !Meteor.user().isAdmin() && account.isTeamAccount
        return (
            <div className="toolbar-panel">
                <div>
                    <Button bsStyle="default" disabled={disabled} onClick={this.onClickEditCompany}><i className="fa fa-edit"/></Button>&nbsp;
                    <Button bsStyle="danger" disabled={disabled} onClick={this.onClickRemoveCompany}><i className="fa fa-trash"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        const {company} = this.props

        if (!company) return null
        return (
            <div style={{marginTop:20}}>
                <div className="thumbnail-view">
                    <div className="picture"></div>
                    <div className="title">{company.name}</div>
                    <div className="info">
                        <div><label>Email:</label><span>{company.email}</span></div>
                        {company.phone_numbers && company.phone_numbers.length>0 &&
                        <div><label>Phone:</label><span>{company.phone_numbers}</span></div>}
                        {company.description && <div><span>{company.description}</span></div>}
                    </div>
                </div>
            </div>
        )
    }

    onClickEditCompany = () => {
        const company = this.props.company
        this.props.onEditCompany && this.props.onEditCompany(company)
    }

    onClickRemoveCompany = () => {
        const company = this.props.company
        this.props.onRemoveCompany && this.props.onRemoveCompany(company)
    }

}

