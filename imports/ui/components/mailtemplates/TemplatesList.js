import React from 'react'
import {Button, Table, InputGroup, FormControl} from 'react-bootstrap'
import MailTemplates from '/imports/api/models/mailtemplates/mailtemplates'


export default class TemplatesList extends React.Component {
    static propTypes = {
        onSelectTemplate: React.PropTypes.func,
        onCreateTemplate: React.PropTypes.func,
        selectedTemplate: React.PropTypes.object,
        reloadData: React.PropTypes.bool
    }

    constructor(props) {
        super(props)

        const templates = MailTemplates.find().fetch()
        const selectedTemplate = props.selectedTemplate || templates[0]
        this.state = {
            templates: templates,
            selectedTemplate: selectedTemplate
        }

    }

    componentDidMount() {
        if(this.props.onSelectTemplate) this.props.onSelectTemplate(this.state.selectedTemplate)
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.reloadData) {

            this.setState({
                templates: MailTemplates.find().fetch(),
                selectedTemplate: nextProps.selectedTemplate
            })
        }



    }

    render() {

        return (
            <div className="templates-list">
                {this.renderToolbar()}

                {this.renderContent()}
            </div>
        )
    }

    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    <Button bsStyle="primary" onClick={() => {
                        this.props.onCreateTemplate()
                    }}><i className="fa fa-plus"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        return (
            <div className="content-panel">
                <Table hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Subject</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderRows()}
                    </tbody>
                </Table>
            </div>
        )
    }

    renderRows() {
        let {templates, selectedTemplate} = this.state

        if (!templates || templates.length == 0) return ''

        return templates.map((template, index) => (
            <tr className={selectedTemplate && selectedTemplate._id === template._id ? 'focused' : ''} key={template._id}
                onClick={() => this.onSelectTemplate(template)}>
                <td>{index + 1}</td>
                <td>{template.subject}</td>
            </tr>
        ))
    }

    onSelectTemplate = (template) => {
        this.setState({selectedTemplate: template})
        if (this.props.onSelectTemplate) this.props.onSelectTemplate(template)
    }
}

