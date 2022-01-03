const TokenValue = require("./TokenValue");
module.exports = class PoolValue {
    constructor({carbAmount, tokenAmount, totalContribution, carbLogo, token = new TokenValue({})}) {
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
        this.token = token;
        this.carbLogo = carbLogo;
        this.totalContribution = totalContribution;
    }
}