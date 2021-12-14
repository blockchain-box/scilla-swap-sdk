const TokenAccountValue = require("./TokenAccountValue");
module.exports = class PoolAccountValue {
    constructor({account, token = new TokenAccountValue({}), lpBalance, totalBalance, carbAmount, tokenAmount}) {
        this._account = account;
        this._lpBalance = lpBalance;
        this._totalBalance = totalBalance;
        this._token = token;
        this._carbAmount = carbAmount;
        this._tokenAmount = tokenAmount;
    }

    get account() {
        return this._account;
    }

    get token() {
        return this._token;
    }

    get lpBalance() {
        return this._lpBalance;
    }

    get totalBalance() {
        return this._totalBalance;
    }

    get carbAmount() {
        return this._carbAmount;
    }

    get tokenAmount() {
        return this._tokenAmount;
    }
}