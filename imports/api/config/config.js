const env = Meteor.settings.public ? Meteor.settings.public.env : null;

module.exports = {
    nylas: {
        appId: '4xnb7gd7t7la2kxls35j3k7t3',
        appSecret: '9tbqdscu0b5q16r422t76onnx',
        apiRoot: 'https://api.nylas.com'
    },
    google: {
        clientId: "949141736454-1ikg5jdl1iela2q1ck7lrhgghbpke43l.apps.googleusercontent.com",
        clientSecret: "E_Iahm05NOj9RxgHhelxRo9S",
        redirectUri: `${Meteor.absoluteUrl()}auth/google/callback`
    },
    twilio: {
        accountSid: 'AC3c2ae50d8872dbe6b907b157deb5483c',
        authToken: 'afdae10c9f35c595678a5af23301d022',
        appSid: env == 'development' ? 'APcbc5a71582dd8c085ef5580496229d18' : 'APcce106e0cf8236a9d9009b69f0cc5b00',
        phoneNumber: '+19142905527'
    }
}
