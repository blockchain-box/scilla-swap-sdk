const Token = require("./Token");
module.exports = class Pool {
    constructor({totalContribution, carbAmount, tokenAmount, token = new Token({})}) {
        this.totalContribution = totalContribution;
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
        this.token = token;
    }
}