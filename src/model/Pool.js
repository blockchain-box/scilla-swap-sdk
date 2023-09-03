const Token = require("./Token");
module.exports = class Pool {
    constructor({totalContribution, grphAmount, tokenAmount, token = new Token({})}) {
        this.totalContribution = totalContribution;
        this.grphAmount = grphAmount;
        this.tokenAmount = tokenAmount;
        this.token = token;
    }
}