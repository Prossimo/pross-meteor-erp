
if(Meteor.isServer) {
    Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    })

    Api.addRoute('voice', {authRequired: false}, {
        post: function () {
            const twilio = require('twilio');
            const config = require('../../api/config/config');

            let twiml = new twilio.TwimlResponse();

            twiml.dial(this.request.body.number, {
                callerId: config.twilio.phoneNumber
            });

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: twiml.toString()
            };
        }
    });
}