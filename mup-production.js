module.exports = {
    servers: {
        one: {
            host: '138.197.5.55',
            username: 'root',
            pem: '~/.ssh/id_rsa'
        }
    },

    meteor: {
        name: 'prossimo-prod',
        path: '.',

        servers: {
            one: {},
        },

        ssl: {
            autogenerate: {
                email: 'quotes@prossimo.us',
                domains: 'crm.mavrik.build'
            }
        },

        env: {
            ROOT_URL: 'https://crm.mavrik.build',
            MONGO_URL: 'mongodb://prossimo-user:prossimo2018@ds113700.mlab.com:13700'
        },

        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true
        },

        docker: {
            image: 'abernix/meteord:base',
            args: [
                '-e "VIRTUAL_HOST=crm.mavrik.build"',
                '-e "HTTPS_METHOD=nohttp"'
            ]
        },

        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    }
}
