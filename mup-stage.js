module.exports = {
    servers: {
        one: {
            host: '159.203.107.170',
            username: 'root',
            pem: '~/.ssh/id_rsa'
        }
    },

    meteor: {
        name: 'prossimo-stage',
        path: '.',

        servers: {
            one: {},
        },

        ssl: {
            autogenerate: {
                email: 'quotes@prossimo.us',
                domains: 'crm-test.mavrik.build'
            }
        },

        env: {
            ROOT_URL: 'https://crm-test.mavrik.build',
            // MONGO_URL: 'mongodb://mavrik_user:P4ssiveH0use@ds115580-a0.mlab.com:15580,ds115580-a1.mlab.com:15580/mavrikprod?replicaSet=rs-ds115580'
            MONGO_URL: 'mongodb://mavrik-test:P4ssiveH0use@ds153303-a0.mlab.com:53303,ds153303-a1.mlab.com:53303/mavrik-test?replicaSet=rs-ds153303'
        },

        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true
        },

        docker: {
            image: 'abernix/meteord:node-8.11.2-base',
            args: [
                '-e "VIRTUAL_HOST=crm-test.mavrik.build"',
                '-e "HTTPS_METHOD=nohttp"'
            ]
        },

        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    },
    proxy: {
        domains: 'crm-test.mavrik.build'
    }
}
