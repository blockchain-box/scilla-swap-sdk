module.exports = class CalculateSwapResultDTO {
    constructor({forAddress, fromToken, toToken, fromAmount, isTransfer}) {
        this.forAddress = forAddress;
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.fromAmount = fromAmount;
        this.isTransfer = isTransfer;
    }
}
