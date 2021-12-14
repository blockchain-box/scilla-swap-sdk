const PoolRepository = require("../repository/PoolRepository");
const BigNumber = require("bignumber.js");
const TokenRepository = require("../repository/TokenRepository");

module.exports = class SwapPriceService {
    constructor({
                    poolRepository = new PoolRepository({}),
                    tokenRepository = new TokenRepository({}),
                    carbAddress,
                    swapAddress
                }) {
        this._carbAddress = carbAddress;
        this._swapAddress = swapAddress;
        this._tokenRepository = tokenRepository;
        this._poolRepository = poolRepository;
    }

    async priceOfTokenInCarb(tokenAddress) {
        if (this._carbAddress.toLowerCase() === tokenAddress.toLowerCase()) {
            throw new Error("not allowed to find price of carb in carb");
        }
        const token = await this._tokenRepository.findToken(tokenAddress);
        const pool = await this._poolRepository.findPool({token, swapAddress: this._swapAddress});
        if (!pool) {
            throw new Error("no pool found for address: " + tokenAddress);
        }
        const tokenDenom = new BigNumber(10).pow(token.decimals);
        const carbDenom = new BigNumber(10).pow(8);
        const carbAmount = new BigNumber(pool.carbAmount).div(carbDenom);
        const tokenAmount = new BigNumber(pool.tokenAmount).div(tokenDenom);
        return carbAmount.div(tokenAmount).toFixed(8);
    }

    async priceOfTokenInOtherToken(fromAddress, toAddress) {
        const fromToken = await this._tokenRepository.findToken(fromAddress);

        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            return (1).toFixed(fromToken.decimals);
        }

        if (fromAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const tokenPrice = await this.priceOfTokenInCarb(toAddress);
            return (1 / parseFloat(tokenPrice)).toFixed(fromToken.decimals);
        } else if (toAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const price = await this.priceOfTokenInCarb(fromAddress);
            return parseFloat(price).toFixed(fromToken.decimals);
        } else {
            const rate_token1 = await this.priceOfTokenInCarb(fromAddress);
            const rate_token2 = await this.priceOfTokenInCarb(toAddress);
            return (parseFloat(rate_token1) / parseFloat(rate_token2)).toFixed(fromToken.decimals);
        }
    }
}