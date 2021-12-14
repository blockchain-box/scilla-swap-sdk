const {zilAddress} = require("../share/mapTestAddresses");
module.exports = class Token {
    constructor({address, name, symbol, decimals}) {
        this._address = address;
        this._name = name;
        this._symbol = symbol;
        this._decimals = decimals;
    }

    get address() {
        return this._address;
    }

    get name() {
        return this._name;
    }

    get symbol() {
        return this._symbol;
    }

    get decimals() {
        return this._decimals;
    }

    isZil() {
        return this._address === zilAddress;
    }
}
