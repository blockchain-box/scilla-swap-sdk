module.exports = class SwapResultValue {
    constructor({priceImpact, swapFees, txFees, graphRewards, carbBalance, graphBalance}) {
        this.priceImpact = priceImpact;
        this.swapFees = swapFees;
        this.txFees = txFees;
        this.graphRewards = graphRewards;
        this.carbBalance = carbBalance;
        this.graphBalance = graphBalance;
    }
}
