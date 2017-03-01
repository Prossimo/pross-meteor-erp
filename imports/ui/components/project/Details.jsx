import React from 'react';

class Details extends React.Component{
    constructor(props){
        super(props);


    }

    renderTableRows(rows, data){
         return _.map(rows, (row)=>{
             let value = data[row.field];
             if(value){
                if(row.type === "Date"){
                    value = moment(value).format("MM DD YYYY");
                }

                return (
                    <tr key={row.field}>
                        <td>{row.label}</td>
                        <td>{value}</td>
                    </tr>
                )
             }
             return null;
        })
    }

    render() {
        const { project } = this.props;
        const attrRows = [
            {label: "Shipping mode", field: "shippingMode"},
            {label: "Actual delivery date", field: "actualDeliveryDate", type: "Date"},
            {label: "Production start date", field: "productionStartDate", type: "Date"},
            {label: "Supplier", field: "supplier"},
            {label: "Shipper", field: "shipper"},
        ];
        const shippingRows = [
            {label: "Contact name", field: "shippingContactName"},
            {label: "Contact email", field: "shippingContactEmail"},
            {label: "Contact phone", field: "shippingContactPhone"},
            {label: "Address", field: "shippingAddress"},
            {label: "Notes", field: "shippingNotes"},
        ];
        const billingRows = [
            {label: "Contact name", field: "billingContactName"},
            {label: "Contact email", field: "billingContactEmail"},
            {label: "Contact phone", field: "billingContactPhone"},
            {label: "Address", field: "billingAddress"},
            {label: "Notes", field: "billingNotes"},
        ];

        return (
            <div className="details-inbox-tab">
                <h2>Project Attributes</h2>
                <table className="data-table">
                    <tbody>
                    {this.renderTableRows(attrRows, project)}
                    </tbody>
                </table>

                <h2>Shipping</h2>
                <table className="data-table">
                    <tbody>
                    {this.renderTableRows(shippingRows, project)}
                    </tbody>
                </table>

                <h2>Billing</h2>
                <table className="data-table">
                   <tbody>
                   {this.renderTableRows(billingRows, project)}
                   </tbody>
                </table>
            </div>
        )
    }
}

export default Details;