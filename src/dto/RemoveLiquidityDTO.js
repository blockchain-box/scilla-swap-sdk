module.exports = class RemoveLiquidityDTO {
    constructor({carbAmount, tokenAddress, minCarbAmount, minTokenAmount}) {
        this.carbAmount = carbAmount;
        this.tokenAddress = tokenAddress;
        this.minCarbAmount = minCarbAmount;
        this.minTokenAmount = minTokenAmount;
    }
}