import "./libs";
import "./headConfig";
import "./router";
import "./nylas-sync";
import { ClientErrorLog } from "/imports/utils/logger";

// NOTE: event name is all lower case as per DOM convention
window.addEventListener("unhandledrejection", e => {
  // NOTE: e.preventDefault() must be manually called to prevent the default
  // action which is currently to log the stack trace to console.warn
  e.preventDefault();
  // NOTE: parameters are properties of the event detail property
  const reason = e.detail.reason;
  const promise = e.detail.promise;
  // See Promise.onPossiblyUnhandledRejection for parameter documentation
});

// NOTE: event name is all lower case as per DOM convention
window.addEventListener("rejectionhandled", e => {
  // NOTE: e.preventDefault() must be manually called prevent the default
  // action which is currently unset (but might be set to something in the future)
  e.preventDefault();
  // NOTE: parameters are properties of the event detail property
  const promise = e.detail.promise;
  // See Promise.onUnhandledRejectionHandled for parameter documentation
});

/* Store original window.onerror */
const _GlobalErrorHandler = window.onerror;

window.onerror = (msg, url, line) => {
  ClientErrorLog.error(msg, { file: url, onLine: line });
  if (_GlobalErrorHandler) {
    _GlobalErrorHandler.apply(this, arguments);
  }
};

ClientErrorLog.error("Client error logging test");
