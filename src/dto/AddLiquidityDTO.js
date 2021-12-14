module.exports = class AddLiquidityDTO {
    constructor({carbAmount, tokenAddress, minCarbAmount, maxTokenAmount}) {
        this.carbAmount = carbAmount;
        this.tokenAddress = tokenAddress;
        this.minCarbAmount = minCarbAmount;
        this.maxTokenAmount = maxTokenAmount;
    }
}