module.exports = class SwapTokenForCarbDTO {
    constructor({tokenAddress, minCarbAmount, tokenAmount, recipientAddress, isTransfer, avatar}) {
        this._tokenAddress = tokenAddress;
        this._minCarbAmount = minCarbAmount;
        this._tokenAmount = tokenAmount;
        this._recipientAddress = recipientAddress;
        this._isTransfer = isTransfer;
        this._avatar = avatar;
    }

    get tokenAddress() {
        return this._tokenAddress;
    }

    get minCarbAmount() {
        return this._minCarbAmount;
    }

    get tokenAmount() {
        return this._tokenAmount;
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