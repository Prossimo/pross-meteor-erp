import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import SalesRecords from '/imports/api/models/salesRecords/salesRecords'

export default class SalesRecordSelect extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        selectedSalesRecord: PropTypes.object
    }

    constructor(props) {
        super(props)

        const salesRecords = SalesRecords.find().fetch()
        this.state = {
            salesRecords,
            selectedSalesRecord: props.selectedSalesRecord
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        const {salesRecords, selectedSalesRecord} = this.state

        const options = salesRecords.map((t)=>({value:t._id, label:t.name}))
        const value = selectedSalesRecord ? {value:selectedSalesRecord._id, label:selectedSalesRecord.name} : null
        return (
            <Select
                className="select-wrap"
                options={options}
                value={value}
                valueRenderer={(item)=>item.label}
                onChange={this.onChange}
                clearable={true}
                placeholder="Selecte a sales record"
            />
        )
    }

    onChange = (item) => {
        if(!item) {
            this.setState({selectedSalesRecord:null})
            this.props.onChange(null)
            return
        }
        const record = this.state.salesRecords.find((r)=>r._id===item.value)
        this.setState({selectedSalesRecord:record})
        this.props.onChange(record)
    }
}