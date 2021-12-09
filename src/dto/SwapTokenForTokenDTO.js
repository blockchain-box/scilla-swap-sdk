module.exports = class SwapTokenForTokenDTO {
    constructor({fromAddress, toAddress, minToAmount, fromAmount, recipientAddress, isTransfer, avatar}) {
        this._fromAddress = fromAddress;
        this._toAddress = toAddress;
        this._minToAmount = minToAmount;
        this._fromAmount = fromAmount;
        this._recipientAddress = recipientAddress;
        this._isTransfer = isTransfer;
        this._avatar = avatar;
    }


    get fromAddress() {
        return this._fromAddress;
    }

    get toAddress() {
        return this._toAddress;
    }

    get minToAmount() {
        return this._minToAmount;
    }

    get fromAmount() {
        return this._fromAmount;
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