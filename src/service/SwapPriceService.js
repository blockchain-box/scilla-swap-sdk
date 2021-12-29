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
        return this._tokenRepository.priceOfTokenInCarbWithPool(token, pool, this._carbAddress);
    }

    async priceOfTokenInOtherToken(fromAddress, toAddress) {
        const fromToken = await this._tokenRepository.findToken(fromAddress);

        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            return parseFloat((1).toFixed(fromToken.decimals));
        }

        if (fromAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const tokenPrice = await this.priceOfTokenInCarb(toAddress);
            return parseFloat((1 / parseFloat(tokenPrice)).toFixed(fromToken.decimals));
        } else if (toAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const price = await this.priceOfTokenInCarb(fromAddress);
            return parseFloat(parseFloat(price).toFixed(fromToken.decimals));
        } else {
            const rate_token1 = await this.priceOfTokenInCarb(fromAddress);
            const rate_token2 = await this.priceOfTokenInCarb(toAddress);
            return parseFloat((parseFloat(rate_token1) / parseFloat(rate_token2)).toFixed(fromToken.decimals));
        }
    }

    calculateCarbToTokenRate({toToken, carbAmount, pool}) {
        if (toToken.address.toLowerCase() === this._carbAddress.toLowerCase()) {
            return "1.000";
        }
        const carbDenom = new BigNumber(10).pow(8);
        const tokenDenom = new BigNumber(10).pow(toToken.decimals);
        const totalCarbAmount = (new BigNumber(pool.carbAmount).plus(new BigNumber(carbAmount))).div(carbDenom);
        const totalTokenAmount = new BigNumber(pool.tokenAmount).div(tokenDenom);
        return totalCarbAmount.div(totalTokenAmount).toNumber().toFixed(8);
    }

    calculateTokenToCarbRate({toToken, tokenAmount, pool}) {
        if (toToken.address.toLowerCase() === this._carbAddress.toLowerCase()) {
            return "1.000";
        }
        const carbDenom = new BigNumber(10).pow(8);
        const tokenDenom = new BigNumber(10).pow(toToken.decimals);
        const totalCarbAmount = new BigNumber(pool.carbAmount).div(carbDenom);
        const totalTokenAmount = (new BigNumber(pool.tokenAmount).plus(new BigNumber(tokenAmount))).div(tokenDenom);
        return totalCarbAmount.div(totalTokenAmount).toNumber().toFixed(parseInt(toToken.decimals));
    }

    calculateCarbToTokenSwap({toToken, carbAmount, pool}) {
        return new BigNumber(this.calculateCarbToTokenRate({toToken, carbAmount, pool}))
            .multipliedBy(carbAmount).toNumber().toFixed(parseInt(toToken.decimals));
    }

    calculateTokenToCarbSwap({toToken, tokenAmount, pool}) {
        return new BigNumber(this.calculateTokenToCarbRate({toToken, tokenAmount, pool}))
            .multipliedBy(tokenAmount).toNumber().toFixed(8);
    }

    calculateTokenToTokenSwap({isFrom, toToken, fromToken, fromAmount, toAmount, fromPool, toPool}) {
        if (isFrom) {
            const fromTokenToCarb = this.calculateTokenToCarbSwap({
                toToken: fromToken,
                tokenAmount: fromAmount,
                pool: fromPool
            });
            const fromCarbToToken = this.calculateCarbToTokenSwap({toToken, carbAmount: fromTokenToCarb, pool: toPool});
            return fromCarbToToken;
        }
        const toTokenToCarb = this.calculateTokenToCarbSwap({toToken, tokenAmount: toAmount, pool: toPool});
        const fromCarbToToken = this.calculateCarbToTokenSwap({
            toToken: fromToken,
            carbAmount: toTokenToCarb,
            pool: fromPool
        });
        return fromCarbToToken
    }
}