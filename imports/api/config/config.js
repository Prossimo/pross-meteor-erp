
const twilioAppSid = {
    'http://localhost:3000/': 'APcbc5a71582dd8c085ef5580496229d18',
    'http://crm.prossimo.us/': 'AP5516d514602651aab27c3d87370fe12f',
    'https://crm.prossimo.us/': 'APcce106e0cf8236a9d9009b69f0cc5b00'
}

module.exports = {
    nylas: {
        appId: '4xnb7gd7t7la2kxls35j3k7t3',
        appSecret: '9tbqdscu0b5q16r422t76onnx',
        apiRoot: 'https://api.nylas.com'
    },
    google: {
        clientId: "949141736454-1ikg5jdl1iela2q1ck7lrhgghbpke43l.apps.googleusercontent.com",
        clientSecret: "E_Iahm05NOj9RxgHhelxRo9S",
        redirectUri: `${Meteor.absoluteUrl()}auth/google/callback`,
        clientDriveId: '977294428736-it2160rgkpdtrp4hjm3mhjr97n4q5rmp.apps.googleusercontent.com',
        clientDriveSecret: 'aJmwh_egnDWiuebEc2GkEwOA',
        serviceAccountEmail: '977294428736-compute@developer.gserviceaccount.com',
        serviceAccountPemCertPath: `${Meteor.absolutePath}/prossimo-us.pem`
    },
    twilio: {
        accountSid: 'AC3c2ae50d8872dbe6b907b157deb5483c',
        authToken: 'afdae10c9f35c595678a5af23301d022',
        appSid: twilioAppSid[Meteor.absoluteUrl()],
        phoneNumber: '+19142905527'
    },
    slack: {
        apiRoot: "https://slack.com/api",
        apiKey: "xoxp-136423598965-136423599189-142146118262-9e22fb56f47ce5af80c9f3d5ae363666",
        botToken: "xoxb-143253157236-cBzs3iNbCDuxCOIHTPnI2LHG",
        botId: "U477F4M6Y"
    },
    prossDocDrive: {
        clientId: '977294428736-it2160rgkpdtrp4hjm3mhjr97n4q5rmp.apps.googleusercontent.com',
        clientSecret: 'aJmwh_egnDWiuebEc2GkEwOA',
        redirectUri: `${Meteor.absoluteUrl()}auth/google/callback`,
        refreshToken: '1/WE2FqFkUAH4UX54YEXMXzlboX7dfcL_u6D0g187yKyc',
        salesRecordParentFolderId: '0B2L677Tiv56RbmRDUDdTQnZTbHM',
        projectParentFolderId: '0B9TUb-58jBJ-WFp3ZmhsVEZqVmc',
        templateFolderId: '0BzKhdC5zjamxY1g4aEtGMGNWY1k',
    }
};
