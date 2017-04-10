import React, { Component } from 'react';
import classNames from 'classnames';
import AllSalesRecords from '../components/salesRecord/AllSalesRecords';
import CreateSalesRecord from '/imports/ui/components/admin/CreateSalesRecord';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

class TicketsPage extends React.Component{
    constructor(props){
        super(props);
        this.tabs = [
            {
                label: 'All Tickets',
                component: <AllSalesRecords/>
            },
            {
                label: 'Add Ticket',
                component: <CreateSalesRecord/>
            }
        ];
        this.state ={
            activeTab: this.tabs[0],
            keyword: ''
        }
        this.getTabs = this.getTabs.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.getContent = this.getContent.bind(this);
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

     getTabs(){
        const { activeTab } = this.state;
        let showsearchbar = false;
        if (activeTab.label.substring(0, 3) == 'All')
            showsearchbar = true;
        return <div>
            <ul style={{float:'left'}}>
                {this.tabs.map(item=>{
                    return (
                        <li key={item.label}
                            onClick={this.toggleTab.bind(this, item)}
                            className={classNames({'active': item === activeTab})}
                        >{item.label}</li>
                    )
                })}
            </ul>
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

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getContent(){
        const { activeTab } = this.state;
        if(!activeTab.component) return null;
        const props = _.clone(this.props);
        props.salesRecords = props.salesRecords.filter(({ stage, name, supplier, shipper })=> {
            const keyfilter = new RegExp(this.state.keyword,'i');
            return stage === 'ticket' && (this.state.keyword == null || (name.search(keyfilter) > -1));
        });
        props.stage = 'ticket';
        return React.cloneElement(activeTab.component, props);
    }

    render() {
        return (
            <div className='orders-page'>
                <div className='tab-container'>
                    <div className='tab-controls'>
                        {this.getTabs()}
                    </div>
                    <div className='tab-content'>
                        {this.getContent()}
                    </div>
                </div>
            </div>
        )
    }
}
export default TicketsPage;
