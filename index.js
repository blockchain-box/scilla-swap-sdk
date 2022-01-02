const TokenRepository = require("./src/repository/TokenRepository");
const PoolRepository = require("./src/repository/PoolRepository");
const BalanceRepository = require("./src/repository/BalanceRepository");

const SwapService = require("./src/service/SwapService");
const PoolService = require("./src/service/PoolService");
const IsTokenUnLockedDTO = require("./src/dto/IsTokenUnLockedDTO");
const GetPoolsOfAccountDTO = require("./src/dto/GetPoolsOfAccountDTO");
const GetTokenOfAccountInSwapDTO = require("./src/dto/GetTokenOfAccountInSwapDTO");
const SwapPriceService = require("./src/service/SwapPriceService");

module.exports = class SwapDSK {
    constructor({nodeAPI, swapContract, carbContract, graphContract}) {
        this._tokenRepo = new TokenRepository({nodeAPI});
        this._poolRepo = new PoolRepository({nodeAPI});
        this._balanceRepo = new BalanceRepository({nodeAPI});
        this._swapPriceService = new SwapPriceService({
            swapAddress: swapContract,
            carbAddress: carbContract,
            tokenRepository: this._tokenRepo,
            poolRepository: this._poolRepo,
        });
        this._swapService = new SwapService({
            nodeAPI,
            host: "",
            contractAddress: swapContract,
            graphAddress: graphContract,
            carbAddress: carbContract,
            tokenRepository: this._tokenRepo,
            balanceRepository: this._balanceRepo,
            swapPriceService: this._swapPriceService,
        });
        this._poolService = new PoolService({
            contractAddress: swapContract,
            host: "",
            nodeAPI,
            balanceRepository: this._balanceRepo,
            poolRepository: this._poolRepo,
            tokenRepository: this._tokenRepo,
            carbAddress: carbContract,
        });
    }

    async isTokenUnlocked(req = new IsTokenUnLockedDTO({})) {
        return this._swapService.isTokenUnLocked(req);
    }

    async getPoolsOfAccount(req = new GetPoolsOfAccountDTO({})) { // PoolAccountValue
        return this._poolService.getPoolsOfAccount(req.account);
    }

    async getAllPools() { // PoolValue
        return this._poolService.getSwapPools();
    }

    async getTokensOfAccountInSwap(req = new GetTokenOfAccountInSwapDTO({})) { // TokenAccount
        return this._swapService.getTokens(req.account);
    }


    async calculateSwapParams({
                                  isFrom,
                                  fromToken,
                                  toToken,
                                  fromAmount,
                                  toAmount,
                                  avatar = "empty",
                                  isTransfer,
                                  recipientAddress,
                                  slippage,
                                  blocks
                              }) {
        return this._swapService.getSwapTokenToTokenCall({
            isFrom,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            avatar,
            isTransfer,
            recipientAddress,
            slippage,
            blocks,
        });
    }

    async calculateAddLiquidityParams({carbAmount, tokenAddress, blocks, maxTokenAmount, minCarbAmount}) {
        return this._swapService.getAddLiquidityCall({carbAmount, tokenAddress, blocks, maxTokenAmount, minCarbAmount})
    }

    async calculateRemoveLiquidityParams({
                                             minCarbAmount,
                                             blocks,
                                             tokenAddress,
                                             carbAmount,
                                             contributionAmount,
                                             minTokenAmount,
                                         }) {
        return this._swapService.getRemoveLiquidityCall({
            minCarbAmount,
            blocks,
            tokenAddress,
            carbAmount,
            contributionAmount,
            minTokenAmount,
        });
    }

    calculateSwapTokens({
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
        return this._swapPriceService.calculateTokenToTokenSwap({
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
        });
    }

    async getFeesAndRewardsBalances(account) {
        const carbBalance = await this._swapService.getCarbBalance(account);
        const graphBalance = await this._swapService.getGraphBalance(account);
        return {
            carbBalance,
            graphBalance
        };
    }

};
