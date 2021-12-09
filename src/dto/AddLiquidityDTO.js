module.exports = class AddLiquidityDTO {
    constructor({carbAmount, tokenAddress, minCarbAmount, maxTokenAmount}) {
        this._carbAmount = carbAmount;
        this._tokenAddress = tokenAddress;
        this._minCarbAmount = minCarbAmount;
        this._maxTokenAmount = maxTokenAmount;
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

    get maxTokenAmount() {
        return this._maxTokenAmount;
    }
}