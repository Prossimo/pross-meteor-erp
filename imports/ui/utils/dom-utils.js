_ = require('underscore')
_s = require('underscore.string')

DOMUtils = {
    escapeHTMLCharacters: (text) => {
        map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
    }
}
module.exports = DOMUtils
