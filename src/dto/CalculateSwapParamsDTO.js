module.exports = class CalculateSwapParamsDTO {
    constructor({
                    account,
                    fromAddress,
                    isMax,
                    toAddress,
                    fromAmount,
                    avatar = "empty",
                    isTransfer,
                    recipientAddress,
                    price,
                    slippage,
                    blocks,
                }) {
        this.account = account;
        this.isMax = isMax;
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.fromAmount = fromAmount;
        this.avatar = avatar;
        this.isTransfer = isTransfer;
        this.recipientAddress = recipientAddress;
        this.price = price;
        this.slippage = slippage;
        this.blocks = blocks;
    }
}