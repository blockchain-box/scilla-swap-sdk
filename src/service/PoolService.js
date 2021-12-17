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
                    balanceRepository = new BalanceRepository({}),
                    carbAddress,
                }) {
        this._address = contractAddress;
        this._host = host;
        this._nodeAPI = nodeAPI;
        this._zilliqa = new Zilliqa(nodeAPI);
        this._fetcher = this._zilliqa.contracts.at(contractAddress);
        this._poolRepository = poolRepository;
        this._tokenRepository = tokenRepository;
        this._balanceRepository = balanceRepository;
        this._carbAddress = carbAddress;
    }

    async getSwapPools() {
        const state = await this._fetcher.getSubState(fields.pools.pools);
        if (state) {
            const pools = state[fields.pools.pools];
            const tokenAddress = Object.keys(pools);
            const tokens = await Promise.all(tokenAddress.map(async tokenAddress => await this._tokenRepository.findToken(tokenAddress)));
            return Promise.all(tokens.map(async token => new PoolValue({
                token: new TokenValue({
                    address: token.address,
                    name: token.name,
                    symbol: token.symbol,
                    priceZIL: await this._tokenRepository.getPriceOfTokenInZil(token.symbol),
                    logo: mapTokenToLogo(token),
                    priceUSD: await this._tokenRepository.getPriceOfTokenUSD(token.symbol),
                    decimals: token.decimals,
                    priceCarb: this._tokenRepository.priceOfTokenInCarbWithPool(token, {
                        carbAmount: pools[token.address].arguments[0],
                        tokenAmount: pools[token.address].arguments[1]
                    }, this._carbAddress)
                }),
                tokenAmount: pools[token.address].arguments[1],
                carbAmount: pools[token.address].arguments[0],
                carbLogo: mapTokenToLogo({address: this._carbAddress}),
            })));
        }
        return [];
    }

    async getPoolsOfAccount(forAddress) {
        if (!forAddress) {
            return [];
        }
        const state = await this._fetcher.getSubState(fields.pools.pools);
        if (state && state[fields.pools.pools]) {
            const tokenAddresses = Object.keys(state[fields.pools.pools]);
            const tokens = await Promise.all(tokenAddresses.map(async address => await this._tokenRepository.findToken(address)));
            const pools = await Promise.all(tokens.map(async token => await this._poolRepository.findPool({
                token: token,
                swapAddress: this._address
            })));
            const allPools = await Promise.all(pools.map(async pool => {
                const lpBalance = await this._poolRepository.getLPBalance({
                    tokenAddress: pool.token.address,
                    account: forAddress,
                    swapAddress: this._address
                });
                if (!lpBalance) {
                    return null;
                }
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
                        priceCarb: this._tokenRepository.priceOfTokenInCarbWithPool(pool.token, pool, this._carbAddress)
                    }),
                    lpBalance,
                    totalBalance: await this._poolRepository.getTotalBalance({
                        tokenAddress: pool.token.address,
                        swapAddress: this._address
                    }),
                    tokenBalance: await this._balanceRepository.getBalanceOfToken(forAddress, pool.token.address),
                    priceUSD: await this._tokenRepository.getPriceOfTokenUSD("carb"),
                    carbAmount: pool.carbAmount,
                    tokenAmount: pool.tokenAmount,
                    carbLogo: mapTokenToLogo({address: this._carbAddress}),
                });
            }));
            return allPools.filter(pool => pool !== null);
        }
        return [];
    }


}
