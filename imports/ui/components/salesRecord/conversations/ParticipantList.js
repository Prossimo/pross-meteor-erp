import React, {PropTypes} from 'react'
import {Panel, Button} from 'react-bootstrap'

export default class ParticipantList extends React.Component {
    static propTypes = {
        participants: PropTypes.array.isRequired,
        onAddParticipant: PropTypes.func,
        addableParticipant: PropTypes.bool
    }

    constructor(props) {
        super(props)
    }

    render() {
        const style = this.props.style
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>
                    Participants
                </div>
                <div>
                    {this.props.addableParticipant && <Button bsStyle="danger" bsSize="xsmall"
                            onClick={this.props.onAddParticipant}>
                        <i className="fa fa-plus"/>
                    </Button>}
                </div>
            </div>
        )
        return (
            <div className="participant-list" style={style}>
                <Panel header={header}>
                    {
                        this.props.participants.map((p, i) => (
                            <div key={i} className="participant-item">
                                <div>{p.name}</div>
                                <div>{p.defaultEmail()}</div>
                                <div>{`${p.designation().name} / ${p.role}`}</div>
                            </div>
                        ))
                    }
                </Panel>
            </div>
        )
    }
}