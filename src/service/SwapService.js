const fields = require("../share/swapFields");

const {Zilliqa} = require("@zilliqa-js/zilliqa");
const tokenToNumber = require("../utils/tokenToNumber");
const axios = require("axios");

const {Uint128, Bool, ByStr20, BNum, String} = require("../share/scillaTypes");

const transitions = {
    WithdrawCarb() {
        return [];
    },
    ClaimGraph() {
        return [];
    },
    AddLiquidity({carb_amount, token_address, min_contribution_amount, max_token_amount, deadline_block}) {
        return [
            Uint128("carb_amount", carb_amount),
            ByStr20("token_address", token_address),
            Uint128("min_contribution_amount", min_contribution_amount),
            Uint128("max_token_amount", max_token_amount),
            BNum("deadline_block", deadline_block)
        ];
    },
    RemoveLiquidity({token_address, contribution_amount, min_carb_amount, min_token_amount, deadline_block}) {
        return [
            ByStr20("token_address", token_address),
            Uint128("contribution_amount", contribution_amount),
            Uint128("min_carb_amount", min_carb_amount),
            Uint128("min_token_amount", min_token_amount),
            BNum("deadline_block", deadline_block),
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
            Uint128("amount", amount),
            ByStr20("token_address", token_address),
            Uint128("min_token_amount", min_token_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
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
            ByStr20("token_address", token_address),
            Uint128("token_amount", token_amount),
            Uint128("min_carb_amount", min_carb_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
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
            ByStr20("token0_address", token0_address),
            ByStr20("token1_address", token1_address),
            Uint128("token0_amount", token0_amount),
            Uint128("min_token1_amount", min_token1_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
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
            ByStr20("token0_address", token0_address),
            ByStr20("token1_address", token1_address),
            Uint128("max_token0_amount", max_token0_amount),
            Uint128("token1_amount", token1_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
        ];
    },
};

const AddLiquidityDTO = require("../dto/AddLiquidityDTO");
const RemoveLiquidityDTO = require("../dto/RemoveLiquidityDTO");
const SwapTokenForTokenDTO = require("../dto/SwapTokenForTokenDTO");
const SwapCarbForTokenDTO = require("../dto/SwapCarbForTokenDTO");
const SwapTokenForCarbDTO = require("../dto/SwapTokenForCarbDTO");

const SwapValue = require("../value/SwapValue");

const {tokens, zilAddress} = require("../share/mapTestAddresses");
const zil_address = zilAddress;
const mapTestToMainAddresses = tokens;
const {toBech32Address} = require("@zilliqa-js/crypto");
const BigNumber = require("bignumber.js");
const TokenRepository = require("../repository/TokenRepository");
const TokenAccountValue = require("../value/TokenAccountValue");
const mapTokenToLogo = require("../share/mapTokenToLogo");
const BalanceRepository = require("../repository/BalanceRepository");
const SwapResultValue = require("../value/SwapResultValue");
const SwapPriceService = require("./SwapPriceService");

module.exports = class SwapService {
    constructor({
                    contractAddress,
                    host,
                    nodeAPI,
                    carbAddress,
                    graphAddress,
                    tokenRepository = new TokenRepository({}),
                    balanceRepository = new BalanceRepository({}),
                    swapPriceService = new SwapPriceService({})
                }) {
        this._address = contractAddress;
        this._host = host;
        this._zilliqa = new Zilliqa(nodeAPI);
        this._fetcher = this._zilliqa.contracts.at(contractAddress);
        this._carbAddress = carbAddress;
        this._graphAddress = graphAddress;
        this._deadline_block = 10;
        this._min = 0.01;
        this._tokenRepository = tokenRepository;
        this._balanceRepository = balanceRepository;
        this._swapPriceService = swapPriceService;
    }

    setDeadlineBlock(blocks) {
        this._deadline_block = blocks;
    }

    setMin(min) {
        this._min = min;
    }

    async getBlockNumber() {
        const {result} = await this._zilliqa.blockchain.getNumTxBlocks();
        return parseInt(result ? result : "100");
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

        if (this._min === 0.0) {
            return transitions.SwapTokensForExactTokens({
                token0_address: tokenToTokenDTO.fromAddress,
                token1_address: tokenToTokenDTO.toAddress,
                max_token0_amount: tokenToTokenDTO.fromAmount,
                token1_amount: tokenToTokenDTO.minToAmount,
                deadline_block: blockNum + this._deadline_block,
                recipient_address: tokenToTokenDTO.recipientAddress,
                avatar: tokenToTokenDTO.avatar,
                is_transfer: tokenToTokenDTO.isTransfer,
            });
        }

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

    async calculateSwapToAmount({fromAddress, toAddress, fromAmount}) {
        if (fromAmount.toLowerCase() === toAddress.toLowerCase()) {
            return fromAmount;
        }
        const price = await this._swapPriceService.priceOfTokenInOtherToken(fromAddress, toAddress);
        return price * fromAmount;
    }

    //TODO
    async getPriceImpact({fromAddress, toAddress, fromAmount}) {
        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            return 0;
        }
        return 1;
    }

    async getSwapFees({fromAddress, fromAmount}) {
        const state = await this._fetcher.getState();
        const fees = parseInt(state[fields.output_after_fee.output_after_fee]) / 1000000;
        if (fromAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            return parseFloat(fromAmount) * fees;
        }
        const price = await this._swapPriceService.priceOfTokenInOtherToken(fromAddress === zil_address ? this._carbAddress : fromAddress, fromAddress === zil_address ? fromAddress : this._carbAddress);
        const total = new BigNumber(price).multipliedBy(new BigNumber(fromAmount));
        return total.multipliedBy(new BigNumber(fees)).toNumber().toFixed(5);
    }

    async getSwapRewards({fromAddress, fromAmount}) {
        const fees = await this.getSwapFees({fromAddress, fromAmount});
        const price = await this._swapPriceService.priceOfTokenInOtherToken(this._carbAddress, this._graphAddress);
        return fees * price;
    }


    async getSwapTokenToTokenCall({
                                      account,
                                      fromToken,
                                      isMax,
                                      toToken,
                                      fromAmount,
                                      avatar = "empty",
                                      isTransfer,
                                      recipientAddress,
                                      price,
                                      slippage,
                                      blocks,
                                  }) {
        const fromAddress = fromToken.address;
        const toAddress = toToken.address;
        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            throw new Error("no allowed to swap for same token");
        }

        this._deadline_block = blocks ? blocks : this._deadline_block;

        const to_denom = new BigNumber(10).pow(new BigNumber(toToken.decimals));
        const from_denom = new BigNumber(10).pow(new BigNumber(fromToken.decimals));

        fromAmount = isMax ? await this._balanceRepository.getBalanceOfToken(account, fromAddress) : new BigNumber(fromAmount).multipliedBy(from_denom).toString();
        const toAmount = new BigNumber(price).multipliedBy(new BigNumber(fromAmount).div(from_denom)).toString();

        if (fromAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const carbAmount = fromAmount;
            const amount = new BigNumber(toAmount).multipliedBy(to_denom).toString();
            const tokenAmount = new BigNumber(amount).minus(new BigNumber(amount).multipliedBy(slippage)).toString();
            const params = await this.getCarbToTokenParams(new SwapCarbForTokenDTO({
                carbAmount,
                minTokenAmount: tokenAmount,
                tokenAddress: toAddress,
                avatar,
                isTransfer,
                recipientAddress,
            }));
            return new SwapValue({
                tag: "SwapExactCarbForTokens",
                params,
                zilAmount: 0,
            });
        } else if (toAddress.toLowerCase() === this._carbAddress.toLowerCase()) {
            const tokenAmount = fromAmount;
            const amount = new BigNumber(toAmount).multipliedBy(to_denom).toString();
            const carbAmount = new BigNumber(amount).minus(new BigNumber(amount).multipliedBy(slippage)).toString();
            const params = await this.getTokenToCarbParams(new SwapTokenForCarbDTO({
                recipientAddress,
                avatar,
                isTransfer,
                tokenAddress: fromAddress,
                tokenAmount,
                minCarbAmount: carbAmount,
            }));
            return new SwapValue({
                tag: "SwapExactTokensForCarb",
                params,
                zilAmount: fromAddress === zilAddress ? tokenAmount : 0,
            });
        }

        const amount = new BigNumber(toAmount).multipliedBy(to_denom).toString();
        const tokenAmount = new BigNumber(amount).minus(new BigNumber(amount).multipliedBy(slippage)).toString();
        const params = await this.getTokenToTokenParams(new SwapTokenForTokenDTO({
            toAddress,
            fromAddress,
            isTransfer,
            recipientAddress,
            avatar,
            fromAmount,
            minToAmount: tokenAmount,
        }));

        return new SwapValue({
            tag: "SwapExactTokensForTokens",
            params,
            zilAmount: fromAddress === zilAddress ? fromAmount : "0",
        });
    }

    async isTokenUnLocked({tokenAddress, account, amount}) {
        const fetcher = this._zilliqa.contracts.at(tokenAddress);
        const state = await fetcher.getSubState("allowances", [account.toLowerCase()]);
        if (state && state["allowances"][account.toLowerCase()][this._address.toLowerCase()]) {
            return BigInt(state["allowances"][account.toLowerCase()][this._address.toLowerCase()]) >= BigInt(amount ? amount : 0);
        }
        return false;
    }

    async getCarbBalance(account) {
        if (!account) {
            return "0.000";
        }
        const state = await this._fetcher.getSubState(fields.carb_balances.carb_balances, [account.toLowerCase()]);
        if (state) {
            return new BigNumber(state[fields.carb_balances.carb_balances][account.toLowerCase()]).div(10 ** 8).toNumber().toFixed(3);
        }
        return "0.000";
    }

    async getGraphBalance(account) {
        if (!account) {
            return "0.000";
        }
        const state = await this._fetcher.getSubState(fields.graph_balances.graph_balances, [account.toLowerCase()]);
        if (state) {
            return new BigNumber(state[fields.graph_balances.graph_balances][account.toLowerCase()]).div(10 ** 8).toNumber().toFixed(3);
        }
        return "0.000";
    }

    async calculateSwapResult({forAddress, fromToken, toToken, fromAmount, isTransfer}) {
        const txFees = isTransfer ? 11 : 6.5;
        const carbBalance = await this.getCarbBalance(forAddress);
        const graphBalance = await this.getGraphBalance(forAddress);
        if (!fromAmount && fromAmount <= 0) {
            return new SwapResultValue({
                priceImpact: 0, // TODO
                swapFees: 0,
                txFees,
                graphRewards: 0,
                carbBalance,
                graphBalance,
            });
        }

        const fromCarbAmount = new BigNumber(fromToken.carbAmount);
        const fromTokenAmount = new BigNumber(fromToken.tokenAmount);

        const toCarbAmount = new BigNumber(toToken.carbAmount);
        const toTokenAmount = new BigNumber(toToken.tokenAmount);

        const swapFees = await this.getSwapFees({fromAddress: fromToken.address, fromAmount});

        const SwapState = await this._fetcher.getSubState(fields.pools.pools);

        const graphPool = SwapState[fields.pools.pools][this._graphAddress];

        const graphCarbAmount = new BigNumber(graphPool.arguments[0]).plus(new BigNumber(swapFees).multipliedBy(new BigNumber(10).pow(8)));
        const graphAmount = new BigNumber(graphPool.arguments[1]);

        const rate = graphAmount.div(graphCarbAmount);

        const graphRewards = rate.multipliedBy(new BigNumber(swapFees)).toNumber().toFixed(5);

        return new SwapResultValue({
            priceImpact: 0, // TODO
            swapFees,
            graphRewards,
            txFees,
            carbBalance,
            graphBalance,
        });

    }

    async getTokens(forAddress) {
        const SwapState = await this._fetcher.getSubState(fields.pools.pools);
        if (SwapState) {
            const pools = SwapState[fields.pools.pools];
            const tokens = await Promise.all(Object.keys(pools).map(async tokenAddress => await this._tokenRepository.findToken(tokenAddress)));
            const tokenValues = await Promise.all(tokens.map(async token => new TokenAccountValue({
                address: token.address,
                logo: mapTokenToLogo(token),
                priceUSD: await this._tokenRepository.getPriceOfTokenUSD(token.symbol),
                priceZIL: await this._tokenRepository.getPriceOfTokenInZil(token.symbol),
                symbol: token.symbol,
                name: token.name,
                balance: forAddress ? await this._balanceRepository.getBalanceOfToken(forAddress, token.address) : 0,
                decimals: token.decimals,
                priceCarb: this._tokenRepository.priceOfTokenInCarbWithPool(token, {
                    carbAmount: pools[token.address].arguments[0],
                    tokenAmount: pools[token.address].arguments[1]
                }, this._carbAddress)
            })));
            const carbToken = await this._tokenRepository.findToken(this._carbAddress);
            tokenValues.push(new TokenAccountValue({
                address: carbToken.address,
                symbol: carbToken.symbol,
                name: carbToken.name,
                balance: forAddress ? await this._balanceRepository.getBalanceOfToken(forAddress, carbToken.address) : 0,
                priceZIL: await this._tokenRepository.getPriceOfTokenInZil(carbToken.symbol),
                logo: mapTokenToLogo(carbToken),
                priceUSD: await this._tokenRepository.getPriceOfTokenUSD(carbToken.symbol),
                decimals: carbToken.decimals,
                priceCarb: 1,
            }));
            return tokenValues;
        }
        return [];
    }
}
