import React, { Component } from 'react';
import AllProjects from '../components/project/AllProjects';


class LeadsPage extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        const salesRecords = this.props.salesRecords.filter(({ stage })=> stage === 'lead');
        const LeadSalesRecords = React.cloneElement(<AllProjects/>, { salesRecords });
        return (
            <div className="leads-page">
                { LeadSalesRecords }
            </div>
        )
    }
}
export default LeadsPage;
