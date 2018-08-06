module.exports = {
    servers: {
        one: {
            host: '159.203.107.170',
            username: 'root',
            pem: '~/.ssh/id_rsa'
        }
    },

    proxy: {
        domains: 'crm-test.mavrik.build',
        ssl: {
            letsEncryptEmail: 'quotes@prossimo.us'
        }
    },

    meteor: {
        name: 'prossimo-stage',
        path: '.',

        servers: {
            one: {},
        },

        env: {
            ROOT_URL: 'https://crm-test.mavrik.build',
            MONGO_URL: 'mongodb://prossimo-user:prossimo2018@ds113700.mlab.com:13700/prossimo'
        },

        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true
        },

        docker: {
            image: 'abernix/meteord:base'
        },

        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    }
}
