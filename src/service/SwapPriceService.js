const PoolRepository = require("../repository/PoolRepository");
const BigNumber = require("bignumber.js");
const TokenRepository = require("../repository/TokenRepository");
const fields = require("../share/swapFields");

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

    getInputFor(outputAmount, inputReserve, outputReserve) {
        if (new BigNumber(outputReserve).lte(outputAmount)) {
            return new BigNumber('NaN');
        }

        const numerator = new BigNumber(inputReserve).times(outputAmount);
        const denominator = new BigNumber(outputReserve).minus(outputAmount);
        return numerator.dividedToIntegerBy(denominator);
    }

    getOutputFor(inputAmount, inputReserve, outputReserve) {
        const numerator = new BigNumber(inputAmount).times(outputReserve);
        const denominator = new BigNumber(inputReserve).plus(inputAmount);
        return numerator.dividedToIntegerBy(denominator);
    }

    getOutputs(tokenIn, tokenOut, tokenInAmount, fromPool, toPool) {
        let epsilonOutput; // the zero slippage output
        let expectedOutput;
        if (tokenIn.address === this._carbAddress) { // carb => token
            const {x, y} = toPool;
            epsilonOutput = new BigNumber(tokenInAmount).multipliedBy(y).div(x).toString();
            expectedOutput = this.getOutputFor(tokenInAmount, x, y).toString();
        } else if (tokenOut.address === this._carbAddress) { // token => carb
            const {x, y} = fromPool;
            epsilonOutput = new BigNumber(tokenInAmount).multipliedBy(x).div(y).toString();
            expectedOutput = this.getOutputFor(tokenInAmount, y, x).toString();
        } else { // token => token
            const {x: carb1, y: tr1} = fromPool;
            const intermediateEpsilonOutput = new BigNumber(tokenInAmount).multipliedBy(carb1).div(tr1);
            const intermediateOutput = this.getOutputFor(tokenInAmount, tr1, carb1);

            const {x: carb2, y: tr2} = toPool;
            epsilonOutput = intermediateEpsilonOutput.multipliedBy(tr2).div(carb2).toString();
            expectedOutput = this.getOutputFor(intermediateOutput, carb2, tr2);
        }

        return {epsilonOutput, expectedOutput};
    }

    getInputs(tokenIn, tokenOut, tokenOutAmount, fromPool, toPool) {
        let expectedInput;
        let epsilonInput; // the zero slippage input

        if (tokenIn.address === this._carbAddress) { // carb => token
            const {x, y} = toPool;
            epsilonInput = new BigNumber(tokenOutAmount).multipliedBy(x).div(y).toString();
            expectedInput = this.getInputFor(tokenOutAmount, x, y).toString();
        } else if (tokenOut.address === this._carbAddress) { // token => carb
            const {x, y} = fromPool;
            epsilonInput = new BigNumber(tokenOutAmount).multipliedBy(y).dividedToIntegerBy(x).toString();
            expectedInput = this.getInputFor(tokenOutAmount, y, x).toString();
        } else { // token => token
            const {x: carb1, y: tr1} = toPool;
            const intermediateEpsilonInput = new BigNumber(tokenOutAmount).multipliedBy(carb1).div(tr1);
            const intermediateInput = this.getInputFor(tokenOutAmount, carb1, tr1);

            const {x: carb2, y: tr2} = fromPool;
            epsilonInput = intermediateEpsilonInput.multipliedBy(tr2).div(carb2).toString();
            expectedInput = this.getInputFor(intermediateInput, tr2, carb2).toString();
        }

        return {epsilonInput, expectedInput};
    }

    getRatesForInput(tokenIn, tokenOut, tokenInAmount, fromPool, toPool) {
        const {epsilonOutput, expectedOutput} = this.getOutputs(tokenIn, tokenOut, tokenInAmount, fromPool, toPool)
        return {
            expectedAmount: expectedOutput,
            slippage: new BigNumber(epsilonOutput).minus(expectedOutput).multipliedBy(100).div(epsilonOutput).toString(),
        };
    }

    getRatesForOutput(tokenIn, tokenOut, tokenInAmount, fromPool, toPool) {
        const {epsilonInput, expectedInput} = this.getInputs(tokenIn, tokenOut, tokenInAmount, fromPool, toPool)
        return {
            expectedAmount: expectedInput,
            slippage: new BigNumber(expectedInput).minus(epsilonInput).multipliedBy(100).div(expectedInput).toString(),
        };
    }


    getSwapFees(fromToken, toToken, amount, pool) {
        const fees = 0.0025;
        if (fromToken.address === this._carbAddress.toLowerCase()) {
            return parseFloat(amount) * fees;
        }
        const {expectedAmount} = this.getRatesForInput(fromToken, toToken, new BigNumber(amount).shiftedBy(fromToken.decimals), pool, pool);
        return new BigNumber(expectedAmount).shiftedBy(-8).multipliedBy(fees).toNumber().toFixed(8);
    }

    getSwapRewards(carbToken, graphToken, graphPool, amount) {
        const {expectedAmount} = this.getRatesForInput(carbToken, graphToken, new BigNumber(amount).shiftedBy(graphToken.decimals), graphPool, graphPool);
        return new BigNumber(expectedAmount).shiftedBy(-8);
    }


    calculateTokenToTokenSwap({
                                  isFrom,
                                  toToken,
                                  fromToken,
                                  fromAmount,
                                  toAmount,
                                  fromPool,
                                  toPool,
                                  carbToken,
                                  graphToken,
                                  graphPool
                              }) {
        const srcAmount = isFrom ? fromAmount : toAmount;
        let rateResult;
        if (isFrom) {
            rateResult = this.getRatesForInput(fromToken, toToken, new BigNumber(srcAmount).shiftedBy(fromToken.decimals), fromPool ? fromPool : toPool, toPool ? toPool : fromPool);
        } else {
            rateResult = this.getRatesForOutput(fromToken, toToken, new BigNumber(srcAmount).shiftedBy(toToken.decimals), fromPool ? fromPool : toPool, toPool ? toPool : fromPool);
        }

        const bigAmount = new BigNumber(rateResult.expectedAmount);
        const decimals = isFrom ? toToken.decimals : fromToken.decimals;
        const expectedAmountUnits = bigAmount.shiftedBy(-decimals);
        const srcAmountUnits = new BigNumber(srcAmount).shiftedBy(-decimals);
        const price = expectedAmountUnits.div(srcAmountUnits).pow(isFrom ? 1 : -1).abs().toString();
        const price_decimals = isFrom ? -toToken.decimals : fromToken.decimals;
        const expectedExchangeRate = !price || price === "NaN" ? "0.000" : new BigNumber(price).shiftedBy(price_decimals).toNumber().toFixed(toToken.decimals);
        const isEnoughToToken = isFrom ? new BigNumber(toToken.address === this._carbAddress ? fromPool.carbAmount : toPool.tokenAmount).lt(new BigNumber(rateResult.expectedAmount).plus(1)) : false;

        const isFromZilToCarb = fromToken.symbol.toLowerCase() === "zil" && toToken.symbol.toLowerCase() === "carb";

        const swapFees = isFromZilToCarb ? "0.000" : this.getSwapFees(fromToken, carbToken, srcAmount, fromPool ? fromPool : toPool);
        const swapRewards = isFromZilToCarb ? "0.000" : this.getSwapRewards(carbToken, graphToken, graphPool, swapFees);

        return {
            ...rateResult,
            amountHuman: expectedAmountUnits.toNumber().toFixed(decimals),
            expectedExchangeRate,
            isInsufficientReserves: (!price || price === "NaN" || bigAmount.isNaN() || isEnoughToToken || (new BigNumber(srcAmount).gt(0) && new BigNumber(expectedExchangeRate).eq(0))) && new BigNumber(srcAmount).gt(0),
            expectedSlippage: new BigNumber(rateResult.slippage).shiftedBy(-2).toNumber(),
            swapFees,
            swapRewards,
        };
    }
}
