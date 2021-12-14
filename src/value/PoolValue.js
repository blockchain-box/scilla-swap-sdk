const TokenValue = require("./TokenValue");
module.exports = class PoolValue {
    constructor({carbAmount, tokenAmount, token = new TokenValue({})}) {
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