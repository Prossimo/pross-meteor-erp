import bodyParser from 'body-parser'

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({extended: false}));

Picker.filter((req, res) => {
    return req.method == 'POST'
}).route('/api/voice', (params, req, res, next) => {

    const twilio = require('twilio');
    const config = require('../../api/config/config');

    let twiml = new twilio.TwimlResponse();

    twiml.dial(req.body.number, {
        callerId: config.twilio.phoneNumber
    });

    res.writeHead(200, {
        'Content-Type': 'text/xml'
    })

    res.end(twiml.toString())
})

Picker.filter((req, res) => {
    return req.method == 'GET'
}).route('/api/download', function (params, req, res, next) {
    const query = params.query



    const request = require('request')
    request.get(`https://api.nylas.com/files/${query.file_id}/download`, {
        auth: {
            user: query.access_token,
            password: '',
            sendImmediately: true
        }
    })
        .on('response', function (response) {
            if(response.statusCode == 200) {
                const clean = require('../../api/lib/validate-http-headers')
                let headers = {
                    "Content-Disposition": response.headers['content-disposition'],
                    "Content-Type": response.headers['content-type'],
                    "Content-Length": response.headers['content-length']
                }
                headers = clean(headers)

                res.writeHead(200, headers)
            } else {
                res.write('Can not download file')
            }

        })
        .pipe(res)
});