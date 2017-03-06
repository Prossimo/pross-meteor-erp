RegExpUtils = {
    emailRegex: () => new RegExp(/([a-z.A-Z0-9!#$%&'*+\-/=?^_`{|}~;:]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63})/g)
}

module.exports = RegExpUtils