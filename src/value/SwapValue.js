const SwapResultValue = require("./SwapResultValue");

module.exports = class SwapValue {
    constructor({tag, params, swapResult = new SwapResultValue({})}) {
        this.tag = tag;
        this.params = params;
        this.swapResult = swapResult;
    }
}