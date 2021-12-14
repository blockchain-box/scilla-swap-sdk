const TokenRepository = require("./src/repository/TokenRepository");
const PoolRepository = require("./src/repository/PoolRepository");
const BalanceRepository = require("./src/repository/BalanceRepository");

const SwapService = require("./src/service/SwapService");
const PoolService = require("./src/service/PoolService");
const IsTokenUnLockedDTO = require("./src/dto/IsTokenUnLockedDTO");
const GetPoolsOfAccountDTO = require("./src/dto/GetPoolsOfAccountDTO");
const GetTokenOfAccountInSwapDTO = require("./src/dto/GetTokenOfAccountInSwapDTO");
const CalculateSwapResultDTO = require("./src/dto/CalculateSwapResultDTO");
const SwapPriceService = require("./src/service/SwapPriceService");

module.exports = class SwapDSK {
    constructor({nodeAPI, swapContract, carbContract, graphContract}) {
        this._tokenRepo = new TokenRepository({nodeAPI});
        this._poolRepo = new PoolRepository({nodeAPI});
        this._balanceRepo = new BalanceRepository({nodeAPI});
        this._swapService = new SwapService({
            nodeAPI,
            host: "",
            contractAddress: swapContract,
            graphAddress: graphContract,
            carbAddress: carbContract,
            tokenRepository: this._tokenRepo,
            balanceRepository: this._balanceRepo,
            swapPriceService: new SwapPriceService({
                swapAddress: swapContract,
                carbAddress: carbContract,
                tokenRepository: this._tokenRepo,
                poolRepository: this._poolRepo,
            }),
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

    async calculateSwapResult(req = new CalculateSwapResultDTO({})) { // SwapResultValue
        return this._swapService.calculateSwapResult(req);
    }
};