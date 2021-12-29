const SwapResultValue = require("./SwapResultValue");

module.exports = class SwapValue {
    constructor({tag, params, zilAmount}) {
        this.tag = tag;
        this.params = params;
        this.zilAmount = zilAmount;
    }
}