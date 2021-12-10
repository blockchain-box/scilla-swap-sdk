module.exports = class SwapValue {
    constructor({tag, params, fees, priceImpact, swapRewards}) {
        this._tag = tag;
        this._params = params;
        this._fees = fees;
        this._priceImpact = priceImpact;
        this._swapRewards = swapRewards;
    }


    get tag() {
        return this._tag;
    }

    get params() {
        return this._params;
    }

    get fees() {
        return this._fees;
    }

    get priceImpact() {
        return this._priceImpact;
    }

    get swapRewards() {
        return this._swapRewards;
    }
}