module.exports = class CalculateSwapResultDTO {
    constructor({fromToken, toToken, fromAmount, isTransfer}) {
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.fromAmount = fromAmount;
        this.isTransfer = isTransfer;
    }
}