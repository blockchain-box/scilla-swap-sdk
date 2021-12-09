module.exports = class RemoveLiquidityDTO {
    constructor({carbAmount, tokenAddress, minCarbAmount, minTokenAmount}) {
        this._carbAmount = carbAmount;
        this._tokenAddress = tokenAddress;
        this._minCarbAmount = minCarbAmount;
        this._minTokenAmount = minTokenAmount;
    }

    get carbAmount() {
        return this._carbAmount;
    }

    get tokenAddress() {
        return this._tokenAddress;
    }

    get minCarbAmount() {
        return this._minCarbAmount;
    }

    get minTokenAmount() {
        return this._minTokenAmount;
    }
}