import React from 'react';

class Quotes extends React.Component{
    constructor(props){
        super(props);

        this.quotes = [
            {
                title: 'Quota #1',
                number: "111-121",
                file: "link"
            }
        ]

    }

    render() {

        return (
            <div className="quotes">
                {this.quotes[0].title}
            </div>
        )
    }
}

export default  Quotes;