module.exports = class CalculateSwapParamsDTO {
    constructor({
                    fromAddress,
                    toAddress,
                    fromAmount,
                    avatar = "empty",
                    isTransfer,
                    recipientAddress,
                    price,
                }) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.fromAmount = fromAmount;
        this.avatar = avatar;
        this.isTransfer = isTransfer;
        this.recipientAddress = recipientAddress;
        this.price = price;
    }
}