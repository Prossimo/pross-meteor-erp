module.exports = {
  google: {
      clientId: "949141736454-1ikg5jdl1iela2q1ck7lrhgghbpke43l.apps.googleusercontent.com",
      clientSecret: "E_Iahm05NOj9RxgHhelxRo9S",
      redirectUri: Meteor.settings.public && Meteor.settings.public.env=='development' ? "http://localhost:3000/auth/google/callback" : "http://crm.prossimo.us/auth/google/callback"
  }
}