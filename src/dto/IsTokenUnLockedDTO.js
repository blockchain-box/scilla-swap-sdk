
module.exports = class IsTokenUnLockedDTO {
    constructor({tokenAddress, account, amount}) {
        this.tokenAddress = tokenAddress;
        this.account = account;
        this.amount = amount;
    }
}