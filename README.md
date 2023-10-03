# Nebula Genesis Index (NGI) Solidity Contract

![License](https://img.shields.io/badge/license-MIT-blue)
[![Actions Status](https://github.com/yunwei37/blockchain-demo/workflows/CI/badge.svg)](https://github.com/yunwei37/blockchain-demo/actions)

This repository contains the smart contract for Nebula Genesis Index (NGI), an ERC20 token designed for Arbitrum. NGI represents a redeemable crypto index composed of 74% ETH and 26% BTC. The contract enables the automatic purchase of the underlying assets using various DeFi protocols to optimize slippage, including Uniswap, Curve, Balancer, QuickSwap, and SushiSwap. Users can also customize how the input amount is split across these protocols to achieve minimal slippage.

## Table of Contents

- [About NGI](#about-ngi)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Special Permission Functions](#special-permission-functions)
- [License](#license)

## About NGI

### Contract Details

- **Name**: Nebula Genesis Index (NGI)
- **Symbol**: NGI

### Composition

NGI is composed of the following assets:

- 74% Ethereum (ETH)
- 26% Bitcoin (BTC)

### Features

- Mint NGI tokens by depositing USDC, automatically converting to ETH and BTC.
- Customize the split of assets across different DeFi protocols to optimize slippage.
- Burn NGI tokens to receive USDC.
- Pause and unpause contract operations.

## Getting Started

To interact with the NGI contract, follow these steps:

1. [Install an Arbitrum-compatible wallet](https://developer.offchainlabs.com/docs/public_testnet).

2. Add the NGI contract address to your wallet.

3. Deposit USDC into the contract to mint NGI tokens.

4. Customize your asset split and optimize slippage if desired.

5. Withdraw USDC by burning NGI tokens.

## Usage

### Minting NGI Tokens

You can mint NGI tokens by depositing USDC. You have the option to customize your asset split and optimize slippage.

#### Function: `deposit(uint8 tokenIn, uint256 amountIn, uint8 optimization, address recipient)`

- `tokenIn`: The token to deposit (0 for USDC, 1 for wBTC, 2 for wETH).
- `amountIn`: The amount of the token to deposit.
- `optimization`: Level of slippage optimization (0 to 4).
- `recipient`: Address to receive NGI tokens.

### Burning NGI Tokens

You can burn NGI tokens to receive USDC.

#### Function: `withdrawUsdc(uint256 ngiIn, uint8 optimization, address recipient)`

- `ngiIn`: The number of NGI tokens to burn.
- `optimization`: Level of slippage optimization (0 to 4).
- `recipient`: Address to receive USDC.

### Customized Asset Split

You can choose a custom asset split when depositing or withdrawing NGI tokens.

#### Function: `depositCustom(uint8 tokenIn, uint256 amountIn, uint16[5] percentagesWBTCSplit, uint16[5] percentagesWETHSplit, address recipient)`

- `tokenIn`: The token to deposit (0 for USDC, 1 for wBTC, 2 for wETH).
- `amountIn`: The amount of the token to deposit.
- `percentagesWBTCSplit`: Percentages of the token to exchange in each DEX to buy BTC.
- `percentagesWETHSplit`: Percentages of the token to exchange in each DEX to buy ETH.
- `recipient`: Address to receive NGI tokens.

#### Function: `withdrawUsdcCustom(uint256 ngiIn, uint16[5] percentagesWBTCSplit, uint16[5] percentagesWETHSplit, address recipient)`

- `ngiIn`: The number of NGI tokens to burn.
- `percentagesWBTCSplit`: Percentages of the token to exchange in each DEX to buy BTC.
- `percentagesWETHSplit`: Percentages of the token to exchange in each DEX to buy ETH.
- `recipient`: Address to receive USDC.

## Special Permission Functions

- `pause()`: Pauses contract operations (onlyOwner).
- `unpause()`: Unpauses contract operations (onlyOwner).

## License

This smart contract is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
