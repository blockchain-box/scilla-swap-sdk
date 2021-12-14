const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {zilAddress} = require("../share/mapTestAddresses");
const fields = require("../share/swapFields");
const Pool = require("../model/Pool");
const BigNumber = require("bignumber.js");
const Token = require("../model/Token");
module.exports = class PoolRepository {
    constructor({nodeAPI}) {
        this._zilliqa = new Zilliqa(nodeAPI);
    }

    async findPool({token = new Token({}), swapAddress}) {
        const swapContract = this._zilliqa.contracts.at(swapAddress);
        const swapState = await swapContract.getSubState(fields.pools.pools, [token.address.toLowerCase()]);
        if (swapState) {
            const pool = swapState[fields.pools.pools][token.address.toLowerCase()];
            const denomToken = new BigNumber(10).pow(token.decimals);
            const denomCarb = new BigNumber(10).pow(8);
            return new Pool({
                carbAmount: new BigNumber(pool.arguments[0]).div(denomCarb).toNumber(),
                tokenAmount: new BigNumber(pool.arguments[1]).div(denomToken).toNumber(),
                token
            });
        }
        return null;
    }

    async getLPBalance({tokenAddresses, account, swapAddress}) {
        const swapContract = this._zilliqa.contracts.at(swapAddress);
        const swapState = await swapContract.getSubState(fields.balances.balances, [account.toLowerCase()]);
        if (swapState) {
            const balance = swapState[fields.balances.balances][account.toLowerCase()][tokenAddresses.toLowerCase()];
            return balance ? balance : 0;
        }
        return 0;
    }

    async getTotalBalance({tokenAddresses, swapAddress}) {
        const swapContract = this._zilliqa.contracts.at(swapAddress);
        const swapState = await swapContract.getSubState(fields.total_contributions.total_contributions, [tokenAddresses.toLowerCase()]);
        if (swapState) {
            const balance = swapState[fields.balances.balances][tokenAddresses.toLowerCase()];
            return balance ? balance : 0;
        }
        return 0;
    }

}