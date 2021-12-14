
module.exports = class SwapResultValue {
    constructor({priceImpact, swapFees, txFees, graphRewards}) {
        this.priceImpact =priceImpact;
        this.swapFees = swapFees;
        this.txFees = txFees;
        this.graphRewards = graphRewards;
    }
}