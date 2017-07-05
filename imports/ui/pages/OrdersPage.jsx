import React, { Component } from 'react';
import classNames from 'classnames';
import AllSalesRecords from '../components/salesRecord/AllSalesRecords';
import CreateSalesRecordModal from '/imports/ui/components/admin/CreateSalesRecordModal';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

class OrdersPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            keyword: '',
            open: false
        }
        this.getTabs = this.getTabs.bind(this);
        this.openAddModal = this.openAddModal.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this)
    }

    openAddModal() {
      this.setState({
        open: true
      })
    }

    getTabs(){
        let showsearchbar = true;
        return <div>
            <div className="sale-title">
              All Orders
            </div>
            <div style={{float: 'left', width: 100, marginLeft: 50}}>
              <button
                className="btn btn-primary"
                onClick={this.openAddModal}
              >
                <span className="fa fa-plus"></span> Add Deal
              </button>
            </div>
            {showsearchbar &&
            <div style={{float: 'left', width: 250, marginLeft: 50}}>
                <InputGroup>
                    <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                    <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearch}/>
                </InputGroup>
            </div>
            }
        </div>
    }

    onChangeSearch = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout); }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({keyword: keyword.toLowerCase()});
            } else {
                this.setState({keyword: ''});
            }
        }, 500)
    }

    render() {
    const props = _.clone(this.props);
    props.salesRecords = props.salesRecords.filter(({ stage, name, supplier, shipper })=> {
      const keyfilter = new RegExp(this.state.keyword,'i');
      return stage === 'order' && (this.state.keyword == null || (name.search(keyfilter) > -1));
    });
    props.stage = 'order';

    return (
        <div className='orders-page'>
            <div className='tab-container'>
                <div className='tab-controls'>
                    {this.getTabs()}
                </div>
                <div className='tab-content'>
                    <AllSalesRecords {...props} />
                </div>
            </div>
            <CreateSalesRecordModal
              open={this.state.open}
              {...props}
            />
        </div>
    )
    }
}
export default OrdersPage;
