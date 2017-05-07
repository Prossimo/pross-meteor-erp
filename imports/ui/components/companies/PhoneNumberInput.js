import React from 'react'
import {Panel, Button, FormControl} from 'react-bootstrap'
import Select from 'react-select'

import {Companies} from '/imports/api/models'


const phoneTypeOptions = Companies.PHONE_TYPES.map((t) => ({value: t, label: t}))

export default class PhoneNumberInput extends React.Component {
    static propTypes = {
        phoneNumbers: React.PropTypes.array,
        onChange: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            phoneNumbers: props.phoneNumbers
        }
    }

    onClickAddPhoneNumber = () => {
        let {phoneNumbers} = this.state
        const phoneNumber = {
            number: '',
            type: Companies.PHONE_TYPES[0],
            is_default: phoneNumbers.length==0
        }
        phoneNumbers.push(phoneNumber)
        this.setState({phoneNumbers})

        if(this.props.onChange) this.props.onChange(phoneNumbers)
    }

    changeState = (obj, key, val) => {
        if (key === 'is_default' && val == true) {
            this.state.phoneNumbers.forEach((phoneNumber) => {
                phoneNumber.is_default = false;
            });
            obj[key] = true;
        } else {
            obj[key] = val;
        }

        this.setState({phoneNumbers:this.state.phoneNumbers})

        if(this.props.onChange) this.props.onChange(this.state.phoneNumbers)
    }

    render() {
        const {phoneNumbers} = this.state
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>Phone numbers</div>
                <div>
                    <Button bsSize="xsmall"
                            onClick={this.onClickAddPhoneNumber}>
                        <i className="fa fa-plus"/>
                    </Button>
                </div>
            </div>
        )

        return (
            <Panel header={header}>
                <table className='table table-condensed'>
                    <thead>
                    <tr>
                        <th>Number</th>
                        <th>Is Default</th>
                        <th>Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        phoneNumbers.map((phoneNumber, index)=>(
                            <tr key={index}>
                                <td><FormControl type="text" value={phoneNumber.number} onChange={(e)=>this.changeState(phoneNumber, 'number', e.target.value)}/></td>
                                <td><input type="checkbox" checked={phoneNumber.is_default} onChange={(e)=>this.changeState(phoneNumber, 'is_default', e.target.checked)}/> </td>
                                <td><Select
                                    options={phoneTypeOptions}
                                    value={{value:phoneNumber.type,label:phoneNumber.type}}
                                    onChange={(item)=>this.changeState(phoneNumber, 'type', item.value)}
                                    clearable={false}
                                /></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </Panel>
        )
    }
}