module.exports = class SwapTokenForCarbDTO {
    constructor({tokenAddress, minCarbAmount, tokenAmount, recipientAddress, isTransfer, avatar}) {
        this.tokenAddress = tokenAddress;
        this.minCarbAmount = minCarbAmount;
        this.tokenAmount = tokenAmount;
        this.recipientAddress = recipientAddress;
        this.isTransfer = isTransfer;
        this.avatar = avatar;
    }
}