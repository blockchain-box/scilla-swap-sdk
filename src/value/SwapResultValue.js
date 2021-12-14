
module.exports = class SwapResultValue {
    constructor({priceImpact, swapFees, txFees, graphRewards}) {
        this._priceImpact =priceImpact;
        this._swapFees = swapFees;
        this._txFees = txFees;
        this._graphRewards = graphRewards;
    }

    get priceImpact() {
        return this._priceImpact;
    }

    get swapFees() {
        return this._swapFees;
    }

    get txFees() {
        return this._txFees;
    }

    get graphRewards() {
        return this._graphRewards;
    }
}