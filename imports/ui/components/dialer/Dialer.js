import React from 'react'
import config from '../../../api/config/config'

var NumberInputText = React.createClass({
    render: function () {
        return (
            <div className="input-group input-group-sm">
                <input type="tel" className="form-control" placeholder="555-666-7777"
                       value={this.props.currentNumber} onChange={this.props.handleOnChange}/>
            </div>
        );
    }
});

var CountrySelectBox = React.createClass({
    render: function () {
        var self = this;

        var CountryOptions = self.props.countries.map(function (country) {
            var flagClass = 'flag flag-' + country.code;

            return (
                <li key={country.code}>
                    <a href="#" onClick={() => self.props.handleOnChange(country.cc)}>
                        <div className={ flagClass }></div>
                        <span> { country.name } (+{ country.cc })</span>
                    </a>
                </li>
            );
        });

        return (
            <div className="input-group-btn">
                <button type="button" className="btn btn-default dropdown-toggle"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    +<span className="country-code">{self.props.countryCode}</span>
                    <i className="fa fa-caret-down"></i>
                </button>
                <ul className="dropdown-menu">
                    {CountryOptions}
                </ul>
            </div>
        );
    }
});

var LogBox = React.createClass({
    render: function () {
        return (
            <div className="status">
                <div className="log">{this.props.text}</div>
                <p>{this.props.smallText}</p>
            </div>
        );
    }
});

var CallButton = React.createClass({
    render: function () {
        return (
            <button className={'btn btn-circle btn-success ' + (this.props.onPhone ? 'btn-danger' : 'btn-success')}
                    onClick={this.props.handleOnClick} disabled={this.props.disabled}>
                <i className={'fa fa-fw fa-phone ' + (this.props.onPhone ? 'fa-close' : 'fa-phone')}></i>
            </button>
        );
    }
});

var MuteButton = React.createClass({
    render: function () {
        return (
            <button className="btn btn-circle btn-default" onClick={this.props.handleOnClick}>
                <i className={'fa fa-fw fa-microphone ' + (this.props.muted ? 'fa-microphone-slash' : 'fa-microphone')}></i>
            </button>
        );
    }
});

var DTMFTone = React.createClass({
    // Handle numeric buttons
    sendDigit(digit) {
        Twilio.Device.activeConnection().sendDigits(digit);
    },

    render: function () {
        return (
            <div className="keys">
                <div className="key-row">
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('1')}>1</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('2')}>2</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('3')}>3</button>
                </div>
                <div className="key-row">
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('4')}>4</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('5')}>5</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('6')}>6</button>
                </div>
                <div className="key-row">
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('7')}>7</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('8')}>8</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('9')}>9</button>
                </div>
                <div className="key-row">
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('*')}>*</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('0')}>0</button>
                    <button className="btn btn-circle btn-default" onClick={() => this.props.onClick('#')}>#</button>
                </div>
            </div>
        );
    }
});

var Dialer = React.createClass({
    getInitialState() {
        return {
            muted: false,
            log: 'Connecting...',
            onPhone: false,
            countryCode: '1',
            currentNumber: '',
            isValidNumber: false,
            countries: [
                {name: 'United States', cc: '1', code: 'us'},
                {name: 'Great Britain', cc: '44', code: 'gb'},
                {name: 'Colombia', cc: '57', code: 'co'},
                {name: 'Ecuador', cc: '593', code: 'ec'},
                {name: 'Estonia', cc: '372', code: 'ee'},
                {name: 'Germany', cc: '49', code: 'de'},
                {name: 'Hong Kong', cc: '852', code: 'hk'},
                {name: 'Ireland', cc: '353', code: 'ie'},
                {name: 'Singapore', cc: '65', code: 'sg'},
                {name: 'Spain', cc: '34', code: 'es'},
                {name: 'Brazil', cc: '55', code: 'br'},
            ]
        }
    },

    // Initialize after component creation
    componentDidMount() {
        var self = this;

        // Fetch Twilio capability token from our Node.js server
        Meteor.call('getTwilioToken', (err, token) => {
            if (err) {
                console.log(err);
                self.setState({log: 'Could not fetch token, see console.log'});
            } else {
                console.log('Twilio Token', token)
                Twilio.Device.setup(token);
            }
        })

        // Configure event handlers for Twilio Device
        Twilio.Device.disconnect(function () {
            self.setState({
                onPhone: false,
                log: 'Call ended.'
            });
        });

        Twilio.Device.ready(function () {
            self.log = 'Connected';
        });
    },

    // Handle country code selection
    handleChangeCountryCode(countryCode) {
        this.setState({countryCode: countryCode});
    },

    // Handle number input
    handleChangeNumber(e) {
        this.setState({
            currentNumber: e.target.value,
            isValidNumber: /^([0-9]|#|\*)+$/.test(e.target.value.replace(/[-()\s]/g, ''))
        });
    },

    // Handle muting
    handleToggleMute() {
        var muted = !this.state.muted;

        this.setState({muted: muted});
        Twilio.Device.activeConnection().mute(muted);
    },

    // Make an outbound call with the current number,
    // or hang up the current call
    handleToggleCall() {
        if (!this.state.onPhone) {
            this.setState({
                muted: false,
                onPhone: true
            })
            // make outbound call with current number
            var n = '+' + this.state.countryCode + this.state.currentNumber.replace(/\D/g, '');
            Twilio.Device.connect({number: n});
            this.setState({log: 'Calling ' + n})
        } else {
            // hang up call in progress
            Twilio.Device.disconnectAll();
        }
    },

    handleClickNumber(number) { console.log(number)
        number = this.state.currentNumber + String(number)
        this.setState({currentNumber: number})
    },

    render: function () {
        var self = this;

        return (
            <div id="dialer">
                <div id="dial-form" className="input-group input-group-sm">

                    <CountrySelectBox countries={this.state.countries} countryCode={this.state.countryCode}
                                      handleOnChange={this.handleChangeCountryCode}/>

                    <NumberInputText currentNumber={this.state.currentNumber} handleOnChange={this.handleChangeNumber}/>

                </div>

                <DTMFTone onClick={this.handleClickNumber}/>

                <CallButton handleOnClick={this.handleToggleCall} disabled={!this.state.isValidNumber}
                            onPhone={this.state.onPhone}/>

                <LogBox text={this.state.log}/>

            </div>
        );
    }
});

module.exports = Dialer