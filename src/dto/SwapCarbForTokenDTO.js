module.exports = class SwapCarbForTokenDTO {
    constructor({carbAmount, tokenAddress, minTokenAmount, recipientAddress, isTransfer, avatar}) {
        this.carbAmount = carbAmount;
        this.tokenAddress = tokenAddress;
        this.minTokenAmount = minTokenAmount;
        this.recipientAddress = recipientAddress;
        this.isTransfer = isTransfer;
        this.avatar = avatar;
    }
}