module.exports = {
  servers: {
    one: {
      host: "138.197.5.55",
      username: "root",
      pem: "~/.ssh/id_rsa"
    }
  },

  meteor: {
    name: "prossimo-prod",
    path: ".",

    servers: {
      one: {}
    },

    ssl: {
      autogenerate: {
        email: "quotes@prossimo.us",
        domains: "crm.mavrik.build"
      }
    },

    env: {
      ROOT_URL: "https://crm.mavrik.build",
      MONGO_URL:
        "mongodb://mavrik_user:P4ssiveH0use@ds115580-a0.mlab.com:15580,ds115580-a1.mlab.com:15580/mavrikprod?replicaSet=rs-ds115580"
    },

    buildOptions: {
      serverOnly: true,
      debug: true,
      cleanAfterBuild: true
    },

    docker: {
      image: "abernix/meteord:node-8.11.2-base",
      args: ['-e "VIRTUAL_HOST=crm.mavrik.build"', '-e "HTTPS_METHOD=nohttp"']
    },

    deployCheckWaitTime: 60,

    enableUploadProgressBar: true
  },
  proxy: {
    domains: "crm.mavrik.build"
  }
};
