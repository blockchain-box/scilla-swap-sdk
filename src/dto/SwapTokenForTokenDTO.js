module.exports = class SwapTokenForTokenDTO {
    constructor({fromAddress, toAddress, minToAmount, fromAmount, recipientAddress, isTransfer, avatar}) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.minToAmount = minToAmount;
        this.fromAmount = fromAmount;
        this.recipientAddress = recipientAddress;
        this.isTransfer = isTransfer;
        this.avatar = avatar;
    }
}