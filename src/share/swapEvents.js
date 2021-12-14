module.exports = {
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