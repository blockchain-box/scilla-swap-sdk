module.exports = class CalculateSwapResultDTO {
    constructor({fromToken, toToken, fromAmount, isTransfer}) {
        this._fromToken = fromToken;
        this._toToken = toToken;
        this._fromAmount = fromAmount;
        this._isTransfer = isTransfer;
    }

    get fromToken() {
        return this._fromToken;
    }

    get toToken() {
        return this._toToken;
    }

    get fromAmount() {
        return this._fromAmount;
    }

    get isTransfer() {
        return this._isTransfer;
    }
}