module.exports = class SwapCarbForTokenDTO {
    constructor({carbAmount, tokenAddress, minTokenAmount, recipientAddress, isTransfer, avatar}) {
        this._carbAmount = carbAmount;
        this._tokenAddress = tokenAddress;
        this._minTokenAmount = minTokenAmount;
        this._recipientAddress = recipientAddress;
        this._isTransfer = isTransfer;
        this._avatar = avatar;
    }

    get carbAmount() {
        return this._carbAmount;
    }

    get tokenAddress() {
        return this._tokenAddress;
    }

    get minTokenAmount() {
        return this._minTokenAmount;
    }

    get recipientAddress() {
        return this._recipientAddress;
    }

    get isTransfer() {
        return this._isTransfer;
    }

    get avatar() {
        return this._avatar;
    }
}