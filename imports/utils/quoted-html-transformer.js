import _ from 'underscore'
import DOMUtils from './dom-utils'
import quoteStringDetector from './quote-string-detector'

const SIGNATURE_CLASSES = ['.nylas-signature', '.moz-signature', '.front-signature']
class QuotedHTMLTransformerClass {
    annotationClass = 'nylas-quoted-text-segment'

    constructor({isServerSide=false}={}) {
        this.isServerSide = isServerSide
    }

    // Given an html string, it will add the `annotationClass` to the DOM element
    hideQuotedHTML = (html, {keepIfWholeBodyIsQuote} = {}) => {
        const doc = this._parseHTML(html)
        const quoteElements = this._findQuoteLikeElements(doc)
        if (keepIfWholeBodyIsQuote && this._wholeBodyIsQuote(doc, quoteElements)) {
            return doc.children[0].innerHTML
        } else {
            this._annotateElements(quoteElements)
            return doc.children[0].innerHTML
        }
    }

    hasQuotedHTML = (html) => {
        const doc = this._parseHTML(html)
        const quoteElements = this._findQuoteLikeElements(doc)
        return quoteElements.length > 0
    }

    // Public: Removes quoted text from an HTML string
    //
    // If we find a quoted text region that is "inline" with the root level
    // message, meaning it has non quoted text before and after it, then we
    // leave it in the message. If you set the `includeInline` option to true,
    // then all inline blocks will also be removed.
    //
    // - `html` The string full of quoted text areas
    // - `options`
    //   - `includeInline` Defaults false. If true, inline quotes are removed
    //   too
    //   - `keepIfWholeBodyIsQuote` Defaults false. If true, then it will
    //   check to see if the whole html body is a giant quote. If so, it will
    //   preserve it.
    //
    // Returns HTML without quoted text
    removeQuotedHTML = (html, options = {}) => {
        const doc = this._parseHTML(html)
        const quoteElements = this._findQuoteLikeElements(doc, options)
        if (options.keepIfWholeBodyIsQuote && this._wholeBodyIsQuote(doc, quoteElements)) {
            return doc.children[0].innerHTML
        } else {
            DOMUtils.Mutating.removeElements(quoteElements, options)

            // It's possible that the entire body was quoted text and we've removedeverything.
            if (!doc.body) return '<head></head><body></body>'

            this.removeTrailingBr(doc)
            DOMUtils.Mutating.removeElements(quoteStringDetector(doc))
            return doc.children[0].innerHTML
        }
    }

    // Finds any trailing BR tags and removes them in place
    removeTrailingBr = (doc) => {
        const childNodes = doc.body.childNodes
        const extraTailBrTags = []
        for (let i = childNodes.length - 1; i >= 0; i--) {
            const curr = childNodes[i]
            const next = childNodes[i - 1]
            if (curr && curr.nodeName == 'BR' && next && next.nodeName == 'BR')
                extraTailBrTags.push(curr)
            else
                break
        }
        DOMUtils.Mutating.removeElements(extraTailBrTags)
    }

    appendQuotedHTML = (htmlWithoutQuotes, originalHTML) => {
        let doc = this._parseHTML(originalHTML)
        const quoteElements = this._findQuoteLikeElements(doc)
        doc = this._parseHTML(htmlWithoutQuotes)
        for (const node of quoteElements)
            doc.body.appendChild(node)
        return doc.children[0].innerHTML
    }

    restoreAnnotatedHTML = (html) => {
        const doc = this._parseHTML(html)
        const quoteElements = this._findAnnotatedElements(doc)
        this._removeAnnotation(quoteElements)
        return doc.children[0].innerHTML
    }

    _parseHTML = (text) => {
        if(this.isServerSide) {
            const jsdom = require("jsdom");
            const { JSDOM } = jsdom;
            return new JSDOM(text).window.document;
        } else {
            const domParser = new DOMParser()
            let doc
            try {
                doc = domParser.parseFromString(text, 'text/html')
            } catch (error) {
                const text = 'HTML Parser Error: #{error.toString()}'
                doc = domParser.parseFromString(text, 'text/html')
            }
            return doc
        }
    }

    _wholeBodyIsQuote = (doc, quoteElements) => {
        const nonBlankChildElements = []
        for (const child of doc.body.childNodes) {
            if (child.textContent.trim() == '')
                continue
            else nonBlankChildElements.push(child)
        }

        if (nonBlankChildElements.length == 1)
            return _.contains(quoteElements, nonBlankChildElements[0])
        else return false
    }
    // We used to have a scheme where we cached the `doc` object, keyed by
    // the md5 of the text. Unfortunately we can't do this because the
    // `doc` is mutated in place. Returning clones of the DOM is just as
    // bad as re-parsing from string, which is very fast anyway.

    _findQuoteLikeElements = (doc, {includeInline, includeSignature} = {}) => {
        const parsers = [
            this._findGmailQuotes,
            this._findGmailExtra,
            this._findOffice365Quotes,
            this._findBlockquoteQuotes
        ]
        if(includeSignature) parsers.push(this._findSignature)

        let quoteElements = []
        for (const parser of parsers) {
            const els = parser(doc)
            quoteElements = quoteElements.concat(els || [])
        }

        if (!includeInline && quoteElements.length > 0) {
            // This means we only want to remove quoted text that shows up at the
            // end of a message. If there were non quoted content after, it'd be
            // inline.

            const trailingQuotes = this._findTrailingQuotes(doc, quoteElements)
            // Only keep the trailing quotes so we can delete them.
            quoteElements = _.intersection(quoteElements, trailingQuotes)
        }

        return _.compact(_.uniq(quoteElements))
    }

    // This will recursievly move through the DOM, bottom to top, and pick
    // out quoted text blocks. It will stop when it reaches a visible
    // non-quote text region.
    _findTrailingQuotes = (scopeElement, quoteElements = []) => {
        let trailingQuotes = []

        // We need to find only the child nodes that have content in them. We
        // determine if it's an inline quote based on if there's VISIBLE
        // content after a piece of quoted text
        const nodesWithContent = DOMUtils.nodesWithContent(scopeElement)

        // There may be multiple quote blocks that are sibilings of each
        // other at the end of the message. We want to include all of these
        // trailing quote elements.
        for (let i = nodesWithContent.length - 1; i >= 0; i--) {
            const nodeWithContent = nodesWithContent[i]
            if (_.contains(quoteElements, nodeWithContent)) {
                // This is a valid quote. Let's keep it!
                //
                // This quote block may have many more quote blocks inside of it.
                // Luckily we don't need to explicitly find all of those because
                // one this block gets removed from the DOM, we'll delete all
                // sub-quotes as well.
                trailingQuotes.push(nodeWithContent)
                continue
            } else {
                const moreTrailing = this._findTrailingQuotes(nodeWithContent, quoteElements)
                trailingQuotes = trailingQuotes.concat(moreTrailing)
                break
            }
        }


        return trailingQuotes
    }


    _contains = (node, quoteElement) => (node == quoteElement || node.contains(quoteElement))

    _findAnnotatedElements = (doc) => Array.prototype.slice.call(doc.getElementsByClassName(this.annotationClass))

    _annotateElements = (elements=[]) => {
        for (const el of elements) {
            el.classList.add(this.annotationClass)
            const originalDisplay = el.style.display
            el.style.display = 'none'
            el.setAttribute('data-nylas-quoted-text-original-display', originalDisplay)
        }
    }

    _removeAnnotation = (elements=[]) => {
        for (const el of elements) {
            el.classList.remove(this.annotationClass)
            const originalDisplay = el.getAttribute('data-nylas-quoted-text-original-display')
            el.style.display = originalDisplay
            el.removeAttribute('data-nylas-quoted-text-original-display')
        }
    }

    _findGmailExtra = (doc) => Array.prototype.slice.call(doc.querySelectorAll('.gmail_extra'))
    _findGmailQuotes = (doc) =>
        // Gmail creates both div.gmail_quote and blockquote.gmail_quote. The div
        // version marks text but does not cause indentation, but both should be
        // considered quoted text.

        Array.prototype.slice.call(doc.querySelectorAll('.gmail_quote'))

    _findOffice365Quotes = (doc) => {
        let elements = doc.querySelectorAll('#divRplyFwdMsg, #OLK_SRC_BODY_SECTION')
        elements = Array.prototype.slice.call(elements)

        const weirdEl = doc.getElementById('3D"divRplyFwdMsg"')
        if (weirdEl) elements.push(weirdEl)

        elements = _.map(elements, (el) => {
            if (el.previousElementSibling && el.previousElementSibling.nodeName == 'HR')
                return el.parentElement
            else return el
        })
        return elements
    }

    _findBlockquoteQuotes = (doc) => Array.prototype.slice.call(doc.querySelectorAll('blockquote'))

    _findSignature = (doc) => {
        let signatures = []
        SIGNATURE_CLASSES.forEach(cls => {
            signatures = signatures.concat(Array.prototype.slice.call(doc.querySelectorAll(cls)))
        })
        return signatures
    }

}

export const ServerSideQuotedHTMLTransformer = new QuotedHTMLTransformerClass({isServerSide:true})
const QuotedHTMLTransformer = new QuotedHTMLTransformerClass()

export default QuotedHTMLTransformer