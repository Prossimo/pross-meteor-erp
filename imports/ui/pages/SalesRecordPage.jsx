import React from 'react'
import {Modal} from 'react-bootstrap'
import clone from 'lodash/clone'
import AllSalesRecords from '../components/salesRecord/AllSalesRecords'
import CreateSalesRecord from '/imports/ui/components/salesRecord/CreateSalesRecord'
import {SearchInput} from '../components/common'

export default class SalesRecordPage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            keyword: '',
            showModal: false
        }
    }

    getTitle = () => {
        const {stage} = this.props

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
        return (
            <div className="flex">
                <div className="sale-title">
                    {this.getTitle()}
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

    render() {
      const props = clone(this.props)
      props.salesRecords = props.salesRecords.filter(({ stage, name, supplier, shipper }) => {
        const keyfilter = new RegExp(this.state.keyword,'i')
        return (props.stage ? stage === props.stage : 1) && (this.state.keyword == null || (name.search(keyfilter) > -1))
      })

      return (
          <div className="projects-page">
           	<div className="tab-container">
            		<div className="tab-controls">
              		{this.renderTabs()}
            		</div>
            		<div className="tab-content">
              		<AllSalesRecords {...props} keword={this.state.keyword}/>
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
