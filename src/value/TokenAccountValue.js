module.exports = class TokenAccountValue {
    constructor({address, name, symbol, logo, balance, priceUSD, priceZIL, priceCarb, decimals}) {
        this._address = address;
        this._name = symbol;
        this._logo = logo;
        this._balance = balance;
        this._priceUSD = priceUSD;
        this._priceZIL = priceZIL;
        this._name = name;
        this._symbol = symbol;
        this._decimals = decimals;
        this._priceCarb = priceCarb;
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

    get logo() {
        return this._logo;
    }

    get balance() {
        return this._balance;
    }

    get priceUSD() {
        return this._priceUSD;
    }

    get priceZIL() {
        return this._priceZIL;
    }

    get priceCarb() {
        return this._priceCarb;
    }

    get decimals() {
        return this._decimals;
    }
}