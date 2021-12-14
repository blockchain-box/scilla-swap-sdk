const fields = require("../share/swapFields");
const {Zilliqa} = require("@zilliqa-js/zilliqa");

const PoolAccountValue = require("../value/PoolAccountValue");
const PoolRepository = require("../repository/PoolRepository");
const TokenRepository = require("../repository/TokenRepository");
const BalanceRepository = require("../repository/BalanceRepository");
const TokenAccountValue = require("../value/TokenAccountValue");
const mapTokenToLogo = require("../share/mapTokenToLogo");
const PoolValue = require("../value/PoolValue");
const TokenValue = require("../value/TokenValue");

module.exports = class PoolService {
    constructor({
                    contractAddress,
                    host,
                    nodeAPI,
                    poolRepository = new PoolRepository({}),
                    tokenRepository = new TokenRepository({}),
                    balanceRepository = new BalanceRepository({})
                }) {
        this._address = contractAddress;
        this._host = host;
        this._nodeAPI = nodeAPI;
        this._zilliqa = new Zilliqa(nodeAPI);
        this._fetcher = this._zilliqa.contracts.at(contractAddress);
        this._poolRepository = poolRepository;
        this._tokenRepository = tokenRepository;
        this._balanceRepository = balanceRepository;
    }

    async getSwapPools() {
        const state = await this._fetcher.getSubState(fields.pools.pools);
        if (state) {
            const pools = state[fields.pools.pools];
            const tokenAddress = Object.keys(pools);
            const tokens = await Promise.all(tokenAddress.map(async tokenAddress => await this._tokenRepository.findToken(tokenAddress)));
            return tokens.map(async token => new PoolValue({
                token: new TokenValue({
                    address: token.address,
                    name: token.name,
                    symbol: token.symbol,
                    priceZIL: await this._tokenRepository.getPriceOfTokenInZil(token.symbol),
                    logo: mapTokenToLogo(token),
                    priceUSD: await this._tokenRepository.getPriceOfTokenUSD(token.symbol),
                    decimals: token.decimals
                }),
                tokenAmount: pools[token.address].arguments[1],
                carbAmount: pools[token.address].arguments[0],
            }))
        }
        return [];
    }

    async getPoolsOfAccount(forAddress) {
        const balanceState = await this._fetcher.getSubState(fields.balances.balances, [forAddress.toLowerCase()]);
        if (balanceState) {
            const tokenAddresses = Object.keys(balanceState[fields.balances.balances][forAddress.toLowerCase]);
            const tokens = await Promise.all(tokenAddresses.map(async address => await this._tokenRepository.findToken(address)));
            const pools = await Promise.all(tokens.map(async token => await this._poolRepository.findPool({
                token: token,
                swapAddress: this._address
            })));
            return Promise.all(pools.map(async pool => {
                return new PoolAccountValue({
                    account: forAddress,
                    token: new TokenAccountValue({
                        address: pool.token.address,
                        balance: await this._balanceRepository.getBalanceOfToken(forAddress, pool.token.address),
                        priceUSD: await this._tokenRepository.getPriceOfTokenUSD(pool.token.symbol),
                        priceZIL: await this._tokenRepository.getPriceOfTokenInZil(pool.token.symbol),
                        logo: mapTokenToLogo(pool.token),
                        symbol: pool.token.symbol,
                        name: pool.token.name,
                        decimals: pool.token.decimals,
                    }),
                    lpBalance: await this._poolRepository.getLPBalance({
                        tokenAddresses: pool.token.address,
                        account: forAddress,
                        swapAddress: this._address
                    }),
                    totalBalance: await this._poolRepository.getTotalBalance({
                        tokenAddresses: pool.token.address,
                        swapAddress: this._address
                    }),
                    tokenBalance: await this._balanceRepository.getBalanceOfToken(forAddress, pool.token.address),
                    priceUSD: await this._tokenRepository.getPriceOfTokenUSD(pool.token.symbol),
                    carbAmount: pool.carbAmount,
                    tokenAmount: pool.tokenAmount,
                });
            }));
        }
        return [];
    }


}