const TokenAccountValue = require("./TokenAccountValue");
module.exports = class PoolAccountValue {
    constructor({account, token = new TokenAccountValue({}), lpBalance, totalBalance, carbAmount, tokenAmount}) {
        this.account = account;
        this.lpBalance = lpBalance;
        this.totalBalance = totalBalance;
        this.token = token;
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
    }
}