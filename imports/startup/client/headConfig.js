
const defaultTitle = "Meteor app";
DocHead.setTitle(defaultTitle);

const metaCharset = {"charset": "IE=edge"};
const metaIE = {"http-equiv": "X-UA-Compatible", "content": "IE=edge"};
const metaViewport = {"name":"viewport", "content": "width=device-width, initial-scale=1"};

DocHead.addMeta(metaCharset);
DocHead.addMeta(metaIE);
DocHead.addMeta(metaViewport);
