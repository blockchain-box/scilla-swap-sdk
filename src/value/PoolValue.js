const TokenValue = require("./TokenValue");
module.exports = class PoolValue {
    constructor({carbAmount, tokenAmount, token = new TokenValue({})}) {
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
        this.token = token;
    }
}