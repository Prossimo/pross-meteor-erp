import React from 'react'
import Select from 'react-select'
import MailTemplates from '/imports/api/models/mailtemplates/mailtemplates'

export default class TemplateSelect extends React.Component {
    static propTypes = {
        onChange: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        const templates = MailTemplates.find().fetch()
        this.state = {
            templates: templates,
            selectedTemplate: props.selectedTemplate
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        const {templates, selectedTemplate} = this.state

        const options = templates.map((t)=>({value:t._id, label:t.subject}))
        const value = selectedTemplate ? {value:selectedTemplate._id, label:selectedTemplate.subject} : null
        return (
            <Select
                className="select-wrap"
                options={options}
                value={value}
                valueRenderer={(item)=>item.label}
                onChange={this.onChange}
                clearable={true}
                placeholder="Selecte a template?"
            />
        )
    }

    onChange = (item) => {
        if(!item) {
            this.setState({selectedTemplate:null})
            this.props.onChange(template)
            return
        }
        const template = this.state.templates.find((t)=>t._id===item.value)
        this.setState({selectedTemplate:template})
        this.props.onChange(template)
    }
}