module.exports = class GetPoolsOfAccountDTO {
    constructor({account}) {
        this._account = account;
    }
    
    get account() {
        return this._account;
    }
}