# Nebula Synthetics V1

## General concept

Nebula aims to build 100% asset backed tokens, offering a very user-friendly experience. Here some of the advantages:
<<<<<<< HEAD
- Interesting token selections
- Efficient operations to buy the assets with very low slippage 
- Group of tokens in one sigle token
- Buy all the tokens in one transaction

## NGI 
The first token we created is Nebula Genesis Index, backed by 74% WBTC and 26% WETH. It will be available on Polygon.

### Protocols used:
=======

- Interesting token selections
- Efficient operations to buy the assets with very low slippage
- Group of tokens in one sigle token
- Buy all the tokens in one transaction

## NGI

The first token we created is Nebula Genesis Index, backed by 74% wBTC and 26% wETH. It will be available on Polygon.

### Protocols used:

>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
- Curve
- Uniswap V3
- Quickswap
- Sushiswap
- Balancer

<<<<<<< HEAD
### Price

The virtual price of 1 NGI will be : WBTC price * 0.74 + WETH price * 0.26. The contract relays on Chainlink price feeds to fetch this data.

### How it works
User sends deposits WETH, WBTC or USDC in the contract, and the contract will use 74% of the amount to buy WTBC and 26% of the amount to buy WETH, then, NGI tokens will be minted to the user, which are 100% backed. 


### Optimization
=======
### Optimization

>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
The user will be able to pick the optimization level needed for the operation. If the user wants to invest big amounts a hihgher optimization level will be needed in order to protect from slippage, splitting the order across this protocols. Our biggest bet is Curve's TRYCRIPTO pool, as it includes WETH, BTC and USDC and it has ridicolous slippage compared to other AMMs.
