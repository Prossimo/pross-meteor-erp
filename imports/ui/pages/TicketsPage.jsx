import React from 'react';
import AllProjects from '../components/project/AllProjects';

class TicketsPage extends React.Component{
    constructor(props){
        super(props);

    }

    render() {
        const salesRecords = this.props.salesRecords.filter(({ stage })=> stage === 'ticket');
        const ticketSalesRecords= React.cloneElement(<AllProjects/>, { salesRecords });
        return (
            <div className="tickets-page">
                { ticketSalesRecords }
            </div>
        )
    }
}
export default TicketsPage;
