
module.exports = class IsTokenUnLockedDTO {
    constructor({tokenAddress, account, amount}) {
        this._tokenAddress = tokenAddress;
        this._account = account;
        this._amount = amount;
    }
    
    get tokenAddress() {
        return this._tokenAddress;
    }

    get account() {
        return this._account;
    }

    get amount() {
        return this._amount;
    }
}