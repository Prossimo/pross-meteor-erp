import { Meteor } from "meteor/meteor";
import { createAdminUser } from "../../api/models/users/methods";
import "./fixtures";

Meteor.startup(() => {
  const adminId = createAdminUser();

  if (!adminId) return;
  Meteor.call("initVisiableFields", adminId);
});
