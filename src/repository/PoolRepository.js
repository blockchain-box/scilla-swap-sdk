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
        const totalContributionState = await swapContract.getSubState(fields.total_contributions.total_contributions, [token.address.toLowerCase()]);
        if (swapState) {
            const pool = swapState[fields.pools.pools][token.address.toLowerCase()];
            const denomToken = new BigNumber(10).pow(token.decimals);
            const denomGrph = new BigNumber(10).pow(8);
            return new Pool({
                totalContribution: totalContributionState[fields.total_contributions.total_contributions][token.address.toLowerCase()],
                grphAmount: new BigNumber(pool.arguments[0]).div(denomGrph).toNumber(),
                tokenAmount: new BigNumber(pool.arguments[1]).div(denomToken).toNumber(),
                token
            });
        }
        return null;
    }

    async getLPBalance({tokenAddress, account, swapAddress}) {
        const swapContract = this._zilliqa.contracts.at(swapAddress);
        const swapState = await swapContract.getSubState(fields.balances.balances, [tokenAddress.toLowerCase()]);
        if (swapState) {
            const balance = swapState[fields.balances.balances][tokenAddress.toLowerCase()][account.toLowerCase()];
            return balance ? balance : 0;
        }
        return 0;
    }

    async getTotalBalance({tokenAddress, swapAddress}) {
        const swapContract = this._zilliqa.contracts.at(swapAddress);
        const swapState = await swapContract.getSubState(fields.total_contributions.total_contributions, [tokenAddress.toLowerCase()]);
        if (swapState) {
            const balance = swapState[fields.total_contributions.total_contributions][tokenAddress.toLowerCase()];
            return balance ? balance : 0;
        }
        return 0;
    }

}