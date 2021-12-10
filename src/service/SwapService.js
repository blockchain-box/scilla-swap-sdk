const fields = {
    "pools": {
        "pools": "pools",
        "Map (ByStr20) (1cad1acc-fe52-4c91-84b1-d10a6394cd72.Pool)": "Map (ByStr20) (1cad1acc-fe52-4c91-84b1-d10a6394cd72.Pool)"
    },
    "balances": {
        "balances": "balances",
        "Map (ByStr20) (Map (ByStr20) (Uint128))": "Map (ByStr20) (Map (ByStr20) (Uint128))"
    },
    "total_contributions": {
        "total_contributions": "total_contributions",
        "Map (ByStr20) (Uint128)": "Map (ByStr20) (Uint128)"
    },
    "output_after_fee": {"output_after_fee": "output_after_fee", "Uint256": "Uint256"},
    "owner": {"owner": "owner", "ByStr20": "ByStr20"},
    "pending_owner": {"pending_owner": "pending_owner", "ByStr20": "ByStr20"},
    "carb_balances": {"carb_balances": "carb_balances", "Map (ByStr20) (Uint128)": "Map (ByStr20) (Uint128)"},
    "graph_balances": {"graph_balances": "graph_balances", "Map (ByStr20) (Uint128)": "Map (ByStr20) (Uint128)"},
    "carb_min": {"carb_min": "carb_min", "Uint128": "Uint128"},
    "carb_max": {"carb_max": "carb_max", "Uint128": "Uint128"},
    "min_liquidity": {"min_liquidity": "min_liquidity", "Uint128": "Uint128"},
    "whitelisted_token": {"whitelisted_token": "whitelisted_token", "Map (ByStr20) (Bool)": "Map (ByStr20) (Bool)"},
    "is_graph_mint_not_close": {"is_graph_mint_not_close": "is_graph_mint_not_close", "Bool": "Bool"},
    "zil_address": {"zil_address": "zil_address", "ByStr20": "ByStr20"},
    "change_params_user": {"change_params_user": "change_params_user", "ByStr20": "ByStr20"}
};
const events = {
    "Burnt": {
        "name": "Burnt",
        "params": [
            {"name": "pool", "type": "ByStr20"},
            {"name": "address", "type": "ByStr20"},
            {"name": "amount", "type": "Uint128"},
            {"name": "carb_amount", "type": "Uint128"}
        ]
    },
    "OwnershipTransferred": {
        "name": "OwnershipTransferred",
        "params": [{"name": "owner", "type": "ByStr20"}]
    },
    "UnstakeCarb": {
        "name": "UnstakeCarb",
        "params": [
            {"name": "amount", "type": "Uint128"},
            {"name": "account", "type": "ByStr20"}
        ]
    },
    "FeeSet": {
        "name": "FeeSet",
        "params": [{"name": "fee", "type": "Uint256"}]
    },
    "stakeCarb": {
        "name": "stakeCarb",
        "params": [
            {"name": "amount", "type": "Uint128"},
            {"name": "account", "type": "ByStr20"}
        ]
    },
    "SetTokenToWhitelist": {
        "name": "SetTokenToWhitelist",
        "params": [{"name": "token", "type": "ByStr20"}]
    },
    "Mint": {
        "name": "Mint",
        "params": [
            {"name": "pool", "type": "ByStr20"},
            {"name": "address", "type": "ByStr20"},
            {"name": "amount", "type": "Uint128"},
            {"name": "carb_amount", "type": "Uint128"}
        ]
    },
    "PoolCreated": {
        "name": "PoolCreated",
        "params": [{"name": "pool", "type": "ByStr20"}]
    },
    "Swap": {
        "name": "Swap",
        "params": [{"name": "calculated_amount", "type": "Uint128"}]
    },
    "SwapFeeAndRewards": {
        "name": "SwapFeeAndRewards",
        "params": [
            {"name": "carb_fees", "type": "Uint128"},
            {"name": "graph_rewards", "type": "Uint128"}
        ]
    },
    "Swapped": {
        "name": "Swapped",
        "params": [
            {"name": "pool", "type": "ByStr20"},
            {"name": "address", "type": "ByStr20"},
            {"name": "input", "type": "1cad1acc-fe52-4c91-84b1-d10a6394cd72.Coins"},
            {"name": "output", "type": "1cad1acc-fe52-4c91-84b1-d10a6394cd72.Coins"},
            {"name": "avatar", "type": "String"}
        ]
    }
};


const {Zilliqa} = require("@zilliqa-js/zilliqa");
const tokenToNumber = require("../utils/tokenToNumber");

const transitions = {
    WithdrawCarb() {
        return [];
    },
    ClaimGraph() {
        return [];
    },
    AddLiquidity({carb_amount, token_address, min_contribution_amount, max_token_amount, deadline_block}) {
        return [
            {"vname": "carb_amount", "type": "Uint128", value: carb_amount.toString()},
            {"vname": "token_address", "type": "ByStr20", value: token_address.toString()},
            {"vname": "min_contribution_amount", "type": "Uint128", value: min_contribution_amount.toString()},
            {"vname": "max_token_amount", "type": "Uint128", value: max_token_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()}
        ];
    },
    RemoveLiquidity({token_address, contribution_amount, min_carb_amount, min_token_amount, deadline_block}) {
        return [
            {"vname": "token_address", "type": "ByStr20", value: token_address.toString()},
            {"vname": "contribution_amount", "type": "Uint128", value: contribution_amount.toString()},
            {"vname": "min_carb_amount", "type": "Uint128", value: min_carb_amount.toString()},
            {"vname": "min_token_amount", "type": "Uint128", value: min_token_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()}
        ];
    },
    SwapExactCarbForTokens({
                               amount,
                               token_address,
                               min_token_amount,
                               deadline_block,
                               recipient_address,
                               is_transfer,
                               avatar
                           }) {
        return [
            {"vname": "amount", "type": "Uint128", value: amount.toString()},
            {"vname": "token_address", "type": "ByStr20", value: token_address.toString()},
            {"vname": "min_token_amount", "type": "Uint128", value: min_token_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()},
            {"vname": "recipient_address", "type": "ByStr20", value: recipient_address.toString()},
            {
                "vname": "is_transfer",
                "type": "Bool",
                value: {constructor: is_transfer ? "True" : "False", argtypes: [], arguments: []}
            },
            {"vname": "avatar", "type": "String", value: avatar.toString()}
        ];
    },
    SwapExactTokensForCarb({
                               token_address,
                               token_amount,
                               min_carb_amount,
                               deadline_block,
                               recipient_address,
                               is_transfer,
                               avatar
                           }) {
        return [
            {"vname": "token_address", "type": "ByStr20", value: token_address.toString()},
            {"vname": "token_amount", "type": "Uint128", value: token_amount.toString()},
            {"vname": "min_carb_amount", "type": "Uint128", value: min_carb_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()},
            {"vname": "recipient_address", "type": "ByStr20", value: recipient_address.toString()},
            {
                "vname": "is_transfer",
                "type": "Bool",
                value: {constructor: is_transfer ? "True" : "False", argtypes: [], arguments: []}
            },
            {"vname": "avatar", "type": "String", value: avatar}
        ];
    },
    SwapExactTokensForTokens({
                                 token0_address,
                                 token1_address,
                                 token0_amount,
                                 min_token1_amount,
                                 deadline_block,
                                 recipient_address,
                                 is_transfer,
                                 avatar
                             }) {
        return [
            {"vname": "token0_address", "type": "ByStr20", value: token0_address.toString()},
            {"vname": "token1_address", "type": "ByStr20", value: token1_address.toString()},
            {"vname": "token0_amount", "type": "Uint128", value: token0_amount.toString()},
            {"vname": "min_token1_amount", "type": "Uint128", value: min_token1_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()},
            {"vname": "recipient_address", "type": "ByStr20", value: recipient_address.toString()},
            {
                "vname": "is_transfer",
                "type": "Bool",
                value: {constructor: is_transfer ? "True" : "False", argtypes: [], arguments: []}
            },
            {"vname": "avatar", "type": "String", value: avatar.toString()}
        ];
    },
    SwapTokensForExactTokens({
                                 token0_address,
                                 token1_address,
                                 max_token0_amount,
                                 token1_amount,
                                 deadline_block,
                                 recipient_address,
                                 is_transfer,
                                 avatar
                             }) {
        return [
            {"vname": "token0_address", "type": "ByStr20", value: token0_address.toString()},
            {"vname": "token1_address", "type": "ByStr20", value: token1_address.toString()},
            {"vname": "max_token0_amount", "type": "Uint128", value: max_token0_amount.toString()},
            {"vname": "token1_amount", "type": "Uint128", value: token1_amount.toString()},
            {"vname": "deadline_block", "type": "BNum", value: deadline_block.toString()},
            {"vname": "recipient_address", "type": "ByStr20", value: recipient_address.toString()},
            {
                "vname": "is_transfer",
                "type": "Bool",
                value: {constructor: is_transfer ? "True" : "False", argtypes: [], arguments: []}
            },
            {"vname": "avatar", "type": "String", value: avatar.toString()}
        ];
    },
};

const AddLiquidityDTO = require("../dto/AddLiquidityDTO");
const RemoveLiquidityDTO = require("../dto/RemoveLiquidityDTO");
const SwapTokenForTokenDTO = require("../dto/SwapTokenForTokenDTO");
const SwapCarbForTokenDTO = require("../dto/SwapCarbForTokenDTO");
const SwapTokenForCarbDTO = require("../dto/SwapTokenForCarbDTO");

module.exports = class SwapService {
    constructor({contractAddress, host, nodeAPI, carbAddress}) {
        this._address = contractAddress;
        this._host = host;
        this._zilliqa = new Zilliqa(nodeAPI);
        this._fetcher = this._zilliqa.contracts.at(contractAddress);
        this._carbAddress = carbAddress;
        this._deadline_block = 10;
        this._min = 0.01;
    }

    setDeadlineBlock(blocks) {
        this._deadline_block = blocks;
    }

    setMin(min) {
        this._min = min;
    }

    get deadlineBlock() {
        return this._deadline_block;
    }

    get min() {
        return this._min;
    }

    async getState() {
        return this._fetcher.getState();
    }

    async getBalanceOfLPer({tokenAddress, lpAddress}) {
        const state = await this._fetcher.getSubState(fields.balances.balances, [tokenAddress.toLowerCase()]);
        if (state) {
            return tokenToNumber(state[fields.balances.balances][tokenAddress.toLowerCase()][lpAddress.toLowerCase()], "0");
        }
        return 0.00;
    }

    async priceOfTokenInCarb(token_address) {
        const fetcher = this._zilliqa.contracts.at(token_address);
        const decimals = (await fetcher.getInit()).find(({vname}) => vname === "decimals").value;
        const state = await this._fetcher.getState();
        const token_pool = state[fields.pools.pools][token_address];
        return tokenToNumber(token_pool.arguments[0], 8) / tokenToNumber(token_pool.arguments[1], decimals);
    }

    async priceOfTokenInOtherToken(fromAddress, toAddress) {
        const fetcher = this._zilliqa.contracts.at(fromAddress);
        const decimals = parseInt((await fetcher.getInit()).find(({vname}) => vname === "decimals").value);

        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            return (1).toFixed(decimals);
        }

        if (fromAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const tokenPrice = await this.priceOfTokenInCarb(toAddress);
            return (1 / tokenPrice).toFixed(decimals);
        } else if (toAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            return this.priceOfTokenInCarb(fromAddress);
        } else {
            const rate_token1 = await this.priceOfTokenInCarb(fromAddress);
            const rate_token2 = await this.priceOfTokenInCarb(toAddress);
            return parseFloat((rate_token1 / rate_token2).toFixed(decimals));
        }
    }

    async getBlockNumber() {
        const {result} = this._zilliqa.blockchain.getNumTxBlocks();
        return parseInt(result);
    }

    async calcTokenAmountInOtherAmount({fromAddress, fromAmount, toAddress}) {
        const rate = await this.priceOfTokenInOtherToken(fromAddress, toAddress);
        return parseFloat(rate) * fromAmount;
    }

    async getAddLiquidityParams(addLiquidityDTO = new AddLiquidityDTO({})) {
        const blockNum = await this.getBlockNumber();
        return transitions.AddLiquidity({
            carb_amount: addLiquidityDTO.carbAmount,
            token_address: addLiquidityDTO.tokenAddress,
            deadline_block: blockNum + this._deadline_block,
            max_token_amount: addLiquidityDTO.maxTokenAmount,
            min_contribution_amount: addLiquidityDTO.minCarbAmount
        });
    }

    async getRemoveLiquidityParams(removeLiquidityDTO = new RemoveLiquidityDTO({})) {
        const blockNum = await this.getBlockNumber();
        return transitions.RemoveLiquidity({
            token_address: removeLiquidityDTO.tokenAddress,
            min_carb_amount: removeLiquidityDTO.minCarbAmount,
            min_token_amount: removeLiquidityDTO.minTokenAmount,
            contribution_amount: removeLiquidityDTO.carbAmount,
            deadline_block: blockNum + this._deadline_block
        });
    }

    async getCarbToTokenParams(carbToTokenDTO = new SwapCarbForTokenDTO({})) {
        const blockNum = await this.getBlockNumber();
        return transitions.SwapExactCarbForTokens({
            token_address: carbToTokenDTO.tokenAddress,
            min_token_amount: carbToTokenDTO.minTokenAmount,
            avatar: carbToTokenDTO.avatar,
            is_transfer: carbToTokenDTO.isTransfer,
            recipient_address: carbToTokenDTO.recipientAddress,
            amount: carbToTokenDTO.carbAmount,
            deadline_block: blockNum + this._deadline_block
        });
    }

    async getTokenToCarbParams(tokenToCarbDTO = new SwapTokenForCarbDTO({})) {
        const blockNum = await this.getBlockNumber();
        return transitions.SwapExactTokensForCarb({
            token_address: tokenToCarbDTO.tokenAddress,
            min_carb_amount: tokenToCarbDTO.minCarbAmount,
            recipient_address: tokenToCarbDTO.recipientAddress,
            token_amount: tokenToCarbDTO.tokenAmount,
            deadline_block: blockNum + this._deadline_block,
            avatar: tokenToCarbDTO.avatar,
            is_transfer: tokenToCarbDTO.isTransfer,
        });
    }

    async getTokenToTokenParams(tokenToTokenDTO = new SwapTokenForTokenDTO({})) {
        const blockNum = await this.getBlockNumber();
        return transitions.SwapExactTokensForTokens({
            token0_address: tokenToTokenDTO.fromAddress,
            token1_address: tokenToTokenDTO.toAddress,
            token0_amount: tokenToTokenDTO.fromAmount,
            min_token1_amount: tokenToTokenDTO.minToAmount,
            deadline_block: blockNum + this._deadline_block,
            recipient_address: tokenToTokenDTO.recipientAddress,
            avatar: tokenToTokenDTO.avatar,
            is_transfer: tokenToTokenDTO.isTransfer
        });
    }
}