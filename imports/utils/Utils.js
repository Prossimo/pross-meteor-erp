import _ from "underscore";
import fs from "fs-plus";
import path from "path";
import { SlackUsers } from "/imports/api/models";

module.exports = Utils = {
  waitFor: (latch, options = {}) => {
    const timeout = options.timeout || 400;
    const expire = Date.now() + timeout;
    return new Promise((resolve, reject) => {
      const attempt = () => {
        if (Date.now() > expire)
          return reject(
            new Error(
              "Utils.waitFor hit timeout (#{timeout}ms) without firing."
            )
          );
        if (latch()) return resolve();
        window.requestAnimationFrame(attempt);
      };
      attempt();
    });
  },

  isEqualReact: (a, b, options = {}) => {
    options.functionsAreEqual = true;
    options.ignoreKeys = (options.ignoreKeys || []).push("clientId");
    return Utils.isEqual(a, b, options);
  },

  isEqual: (a, b, options = {}) => {
    const value = Utils._isEqual(a, b, [], [], options);
    if (options.logWhenFalse) {
      if (!value) console.log("isEqual is false", a, b, options);
      return value;
    } else return value;
  },

  _isEqual: (a, b, aStack, bStack, options = {}) => {
    if (a === b) return a != 0 || 1 / a == 1 / b;

    if (a == null || b == null) return a == b;

    if (a && a._wrapped) a = a._wrapped;
    if (b && b._wrapped) b = b._wrapped;

    if (options.functionsAreEqual)
      if (_.isFunction(a) && _.isFunction(b)) return true;

    const className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      case ("[object RegExp]", "[object String]"):
        return `${a}` == `${b}`;
      case "[object Number]":
        if (+a != +a) return +b != +b;
        return +a == 0 ? 1 / +a == 1 / b : +a == +b;
      case ("[object Date]", "[object Boolean]"):
        return +a == +b;
    }

    const areArrays = className == "[object Array]";
    if (!areArrays) {
      if (typeof a != "object" || typeof b != "object") return false;

      const aCtor = a.constructor;
      const bCtor = b.constructor;
      if (
        aCtor != bCtor &&
        !(
          _.isFunction(aCtor) &&
          aCtor instanceof aCtor &&
          _.isFunction(bCtor) &&
          bCtor instanceof bCtor
        ) &&
        ("constructor" in a && "constructor" in b)
      )
        return false;
    }

    aStack = aStack || [];
    bStack = bStack || [];
    length = aStack.length;
    while (length--) {
      if (aStack[length] == a) return bStack[length] == b;
    }

    aStack.push(a);
    bStack.push(b);

    if (areArrays) {
      length = a.length;
      if (length != b.length) return false;

      while (length--) {
        if (!Utils._isEqual(a[length], b[length], aStack, bStack, options))
          return false;
      }
    } else {
      let key = undefined;
      const keys = Object.keys(a);
      let length = keys.length;
      if (Object.keys(b).length != length) return false;
      const keysToIgnore = {};
      if (options.ignoreKeys && _.isArray(options.ignoreKeys))
        for (const key of options.ignoreKeys) keysToIgnore[key] = true;
      while (length--) {
        key = keys[length];
        if (key in keysToIgnore) continue;
        if (
          !(
            _.has(b, key) &&
            Utils._isEqual(a[key], b[key], aStack, bStack, options)
          )
        )
          return false;
      }
    }
    aStack.pop();
    bStack.pop();
    return true;
  },

  iconForCategory: folder => {
    const icons = [
      "inbox",
      "archive",
      "drafts",
      "sent",
      "junk",
      "spam",
      "trash",
      "snooze",
      "starred",
      "tag",
      "today",
      "plugins",
      "important",
      "folder",
      "all"
    ];

    return `/icons/inbox/ic-category-${
      folder.name && icons.indexOf(folder.name.trim().toLowerCase()) > -1
        ? folder.name
        : "folder"
    }.png`;
  },

  slackParsedText: text => {
    // Convert normal <asdfasdf> format
    const matches = text.match(/\<[^\>]+\>/g);
    if (matches != null && matches.length) {
      //console.log(matches)
      matches.forEach(m => {
        if (new RegExp(/\<\@[^\>]+\|[^\>]+\>/g).test(m)) {
          // <@U4RPWJB0R|if0109>
          //console.log(m, `@${m.substr(m.indexOf('|') + 1, m.length - m.indexOf('|') - 2)}`)
          text = text.replace(
            m,
            `<a>@${_.escape(
              m.substr(m.indexOf("|") + 1, m.length - m.indexOf("|") - 2)
            )}</a>`
          );
        } else if (new RegExp(/\<\@[^\>]+\>/g).test(m)) {
          // <@U4RPWJB0R>
          //console.log(m, m.substr(2, m.length - 3))
          const slackUser = SlackUsers.findOne({
            id: m.substr(2, m.length - 3)
          });

          // console.log("slackUser  and m", slackUser, m);
          if (slackUser) {
            text = text.replace(m, `<a>@${slackUser.display_name}</a>`);
          } else {
            text = text.replace(
              m,
              `<a title="the user isn't in the list of members of the current Workspace">@${m}</a>`
            );
          }
          console.log("text", text);
        } else if (new RegExp(/\<\#[^\>]+\|[^\>]+\>/g).test(m)) {
          // <#C716GCL3E|channel>
          //console.log(m, `@${m.substr(m.indexOf('|') + 1, m.length - m.indexOf('|') - 2)}`)
          text = text.replace(
            m,
            `<a>#${_.escape(
              m.substr(m.indexOf("|") + 1, m.length - m.indexOf("|") - 2)
            )}</a>`
          );
        } else if (new RegExp(/\<+[^\>]+\|[^\>]+\>/g).test(m)) {
          //<https://crm.mavrik.build/salesrecord/c2g2obaetJxHMLYwr|Go to salesrecord>
          const index = m.indexOf("|");
          //console.log(m, m.substr(1, index-1), m.substr(index + 1, m.length - index - 2))
          text = text.replace(
            m,
            `<a href="${m.substr(1, index - 1)}">${_.escape(
              m.substr(index + 1, m.length - index - 2)
            )}</a>`
          );
        } else {
          // <https://crm.mavrik.build/salesrecord/c2g2obaetJxHMLYwr>
          const token = m.substr(1, m.length - 2);
          //console.log(token)
          text = text.replace(m, `<a href="${token}">${_.escape(token)}</a>`);
        }
      });
    }

    return text;
  },

  jsUcfirst: string => string.charAt(0).toUpperCase() + string.slice(1)
};
