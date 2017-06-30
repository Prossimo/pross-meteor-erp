module.exports = {
    servers: {
        one: {
            host: '138.197.5.55',
            username: 'root',
            pem: '~/.ssh/id_rsa'
        }
    },

    meteor: {
        name: 'prossimo',
        path: '.',

        servers: {
            one: {},
        },

        env: {
            ROOT_URL: 'http://138.197.5.55',
            MONGO_URL: 'mongodb://localhost:27017/prossimo',
        },

        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true
        },
        // ssl: { // (optional)
        //   // Enables let's encrypt (optional)
        //   autogenerate: {
        //     email: 'email.address@domain.com',
        //     // comma seperated list of domains
        //     domains: 'website.com,www.website.com'
        //   }
        // },

        docker: {
            image: 'abernix/meteord:base'
        },

        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    },

    mongo: {
        port: 27017,
        version: '3.4.1',
        servers: {
            one: {}
        }
    }
};
