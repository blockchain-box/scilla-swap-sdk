const SwapResultValue = require("./SwapResultValue");

module.exports = class SwapValue {
    constructor({tag, params, swapResult = new SwapResultValue({}), zilAmount}) {
        this.tag = tag;
        this.params = params;
        this.swapResult = swapResult;
        this.zilAmount = zilAmount;
    }
}