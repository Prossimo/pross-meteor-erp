import React, { Component } from 'react'
import {Modal} from 'react-bootstrap'
import AllSalesRecords from '../components/salesRecord/AllSalesRecords'
import CreateSalesRecord from '/imports/ui/components/salesRecord/CreateSalesRecord'
import {SearchInput} from '../components/common'

export default class SalesRecordPage extends Component{
    state = {
        keyword: '',
        showModal: false
    }

    getTitle = (stage) => {
        switch(stage) {
            case 'lead':
                return 'All Leads'
            case 'opportunity':
                return 'All Opportunity'
            case 'order':
                return 'All Orders'
            case 'ticket':
                return 'All Tickets'
            default:
                return 'All Deals'
        }
    }


    onChangeSearch = (keyword) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        this.searchTimeout = setTimeout(() => {
            this.setState({keyword})
        }, 500)
    }

    renderTabs = () => {
        const { stage } = this.props
        return (
            <div className="flex">
                <div className="sale-title">
                    {this.getTitle(stage)}
                </div>
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={() => this.setState({showModal:true})}
                    >
                        <span className="fa fa-plus"></span> Add Deal
                    </button>
                </div>
                <div className="flex-1">&nbsp;</div>
                <div style={{width:250}}><SearchInput onChange={this.onChangeSearch}/></div>
            </div>
        )

    }

    filterRecords = (list, currentStage) => {
        return list.filter(({ stage, name }) => {
            const keyfilter = new RegExp(this.state.keyword, 'i')
            return (currentStage === stage) && (this.state.keyword == null || (name.search(keyfilter) > -1))
        })
    }

    render() {
        const {stage, ...props} = this.props
        return (
            <div className="projects-page">
                <div className="tab-container">
                    <div className="tab-controls">
                        {this.renderTabs()}
                    </div>
                    <div className="tab-content">
                        {stage ? <AllSalesRecords
                            salesRecords={this.filterRecords(props.salesRecords, stage)}
                            stage={stage}
                            title={this.getTitle(stage)}
                            keyword={this.state.keyword} /> : (
                            <div>
                                <AllSalesRecords
                                    salesRecords={this.filterRecords(props.salesRecords, 'lead')}
                                    stage='lead'
                                    title={this.getTitle('lead')}
                                    keyword={this.state.keyword}/>
                                <AllSalesRecords
                                    salesRecords={this.filterRecords(props.salesRecords, 'opportunity')}
                                    stage='opportunity'
                                    title={this.getTitle('opportunity')}
                                    keyword={this.state.keyword}/>
                                <AllSalesRecords
                                    salesRecords={this.filterRecords(props.salesRecords, 'order')}
                                    stage='order'
                                    title={this.getTitle('order')}
                                    keyword={this.state.keyword}/>
                                <AllSalesRecords
                                    salesRecords={this.filterRecords(props.salesRecords, 'ticket')}
                                    stage='ticket'
                                    title={this.getTitle('ticket')}
                                    keyword={this.state.keyword}/>
                            </div>
                        )}
                    </div>
                </div>
                {this.renderModal(props)}
            </div>
        )
    }

    renderModal = (props) => {
        const {showModal} = this.state
        return (
            <Modal show={showModal} onHide={() => {
                this.setState({showModal: false})
            }} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Create Deal</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CreateSalesRecord {...props}/>
                </Modal.Body>
            </Modal>
        )
    }
}
