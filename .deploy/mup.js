module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: "104.248.8.8",
      username: "root",
      pem: "~/.ssh/do_id_rsa"
      // password: 'server-password'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    // TODO: change app name and path
    name: "prossimo-ref",
    path: "../",

    servers: {
      one: {}
    },

    buildOptions: {
      serverOnly: true,
      debug: false,
      cleanAfterBuild: true
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      NODE_ENV: "production",
      ROOT_URL: "https://crossdevs.com",
      MONGO_URL: "mongodb://mongodb/meteor",
      MONGO_OPLOG_URL: "mongodb://mongodb/local"
    },

    docker: {
      // change to 'abernix/meteord:base' if your app is using Meteor 1.4 - 1.5
      image: "abernix/meteord:node-8.11.2-base"
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  mongo: {
    version: "3.4.1",
    servers: {
      one: {}
    }
  },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  proxy: {
    domains: "crossdevs.com",

    ssl: {
      // Enable Let's Encrypt
      letsEncryptEmail: "aram@alienlab.xyz",
      forceSSL: true
    }
  }
};
