module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: "138.197.5.55",
      username: "root",
      pem: "~/.ssh/id_rsa"
      // password: 'server-password'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    // TODO: change app name and path
    name: "prossimo-prod",
    path: "../",

    servers: {
      one: {}
    },

    buildOptions: {
      serverOnly: true,
      debug: true,
      cleanAfterBuild: true
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      NODE_ENV: "production",
      ROOT_URL: "https://crm.mavrik.build",
      MONGO_URL:
        "mongodb://mavrik_user:P4ssiveH0use@ds115580-a0.mlab.com:15580,ds115580-a1.mlab.com:15580/mavrikprod?replicaSet=rs-ds115580",
      MONGO_OPLOG_URL:
        "mongodb://oplog-reader:P4ssiveH0use@ds115580-a0.mlab.com:15580,ds115580-a1.mlab.com:15580/local?replicaSet=rs-ds115580&authSource=admin"
    },

    docker: {
      // change to 'abernix/meteord:base' if your app is using Meteor 1.4 - 1.5
      image: "abernix/meteord:node-8.11.2-base"
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  // mongo: {
  //   version: "3.4.1",
  //   servers: {
  //     one: {}
  //   }
  // },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  proxy: {
    domains: "crm.mavrik.build",

    ssl: {
      // Enable Let's Encrypt
      letsEncryptEmail: "quotes@prossimo.us",
      forceSSL: true
    }
  }
};
