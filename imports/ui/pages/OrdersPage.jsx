import React from 'react';
import AllProjects from '../components/project/AllProjects';

class OrdersPage extends React.Component{
    constructor(props){
        super(props);

    }

    render() {
        const salesRecords = this.props.salesRecords.filter(({ stage })=> stage === 'order');
        const orderSalesRecords = React.cloneElement(<AllProjects/>, { salesRecords });
        return (
            <div className="orders-page">
                { orderSalesRecords }
            </div>
        )
    }
}
export default OrdersPage;
