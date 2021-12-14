const SwapResultValue = require("./SwapResultValue");

module.exports = class SwapValue {
    constructor({tag, params, swapResult = new SwapResultValue({})}) {
        this._tag = tag;
        this._params = params;
        this._swapResult = swapResult;
    }

    get tag() {
        return this._tag;
    }

    get params() {
        return this._params;
    }

    get swapResult() {
        return this._swapResult;
    }
}