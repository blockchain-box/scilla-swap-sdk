module.exports = class SwapResultValue {
    constructor({priceImpact, swapFees, txFees, grphBalance}) {
        this.priceImpact = priceImpact;
        this.swapFees = swapFees;
        this.txFees = txFees;
        this.grphBalance = grphBalance;
    }
}
