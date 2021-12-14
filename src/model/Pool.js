const Token = require("./Token");
module.exports = class Pool {
    constructor({carbAmount, tokenAmount, token = new Token({})}) {
        this._carbAmount = carbAmount;
        this._tokenAmount = tokenAmount;
        this._token = token;
    }

    get carbAmount() {
        return this._carbAmount;
    }

    get tokenAmount() {
        return this._tokenAmount;
    }

    get token() {
        return this._token;
    }
}