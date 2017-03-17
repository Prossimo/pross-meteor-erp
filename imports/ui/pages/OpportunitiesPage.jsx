import React from 'react';
import AllProjects from '../components/project/AllProjects';

class OpportunitiesPage extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        const salesRecords = this.props.salesRecords.filter(({ stage })=> stage === 'opportunity');
        const opportunitySalesRecords = React.cloneElement(<AllProjects/>, { salesRecords });

        return (
            <div className="opportunities-page">
                { opportunitySalesRecords }
            </div>
        )
    }
}
export default OpportunitiesPage;
