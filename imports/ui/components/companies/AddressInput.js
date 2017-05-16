import React from 'react'
import {Panel, Button, FormControl} from 'react-bootstrap'
import Select from 'react-select'

import {Companies} from '/imports/api/models'

const addressTypeOptions = []

export default class AddressInput extends React.Component {
    static propTypes = {
        addresses: React.PropTypes.array,
        onChange: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            addresses: props.addresses
        }
    }

    onClickAddAddress = () => {
        let {addresses} = this.state
        const address = {
            address: '',
            type: Companies.ADDRESS_TYPES[0],
            is_default: addresses.length==0
        }
        addresses.push(address)
        this.setState({addresses})

        if(this.props.onChange) this.props.onChange(addresses)
    }

    changeState = (obj, key, val) => {
        if (key === 'is_default' && val == true) {
            this.state.addresses.forEach((address) => {
                address.is_default = false;
            });
            obj[key] = true;
        } else {
            obj[key] = val;
        }

        this.setState({addresses:this.state.addresses})

        if(this.props.onChange) this.props.onChange(this.state.addresses)
    }

    render() {
        const {addresses} = this.state
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>Addresses</div>
                <div>
                    <Button bsSize="xsmall"
                            onClick={this.onClickAddAddress}>
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
                        <th>Address</th>
                        <th>Is Default</th>
                        <th>Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        addresses.map((address, index)=>(
                            <tr key={index}>
                                <td><FormControl type="text" value={address.address} onChange={(e)=>this.changeState(address, 'address', e.target.value)}/></td>
                                <td><input type="checkbox" checked={address.is_default} onChange={(e)=>this.changeState(address, 'is_default', e.target.checked)}/> </td>
                                <td><Select
                                    options={addressTypeOptions}
                                    value={{value:address.type,label:address.type}}
                                    onChange={(item)=>this.changeState(address, 'type', item.value)}
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