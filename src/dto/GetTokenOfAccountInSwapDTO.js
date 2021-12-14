module.exports = class GetTokenOfAccountInSwapDTO {
    constructor({account}) {
        this._account = account;
    }

    get account() {
        return this._account;
    }
}