// SPDX-License-Identifier: MIT

/**
 * @author : Nebula.fi
 * wBTC-wETH
 */

pragma solidity ^0.8.7;
import "../../utils/ChainId.sol";
import "./NGISplitter.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract GenesisIndex is ERC20Upgradeable, OwnableUpgradeable, PausableUpgradeable, ChainId, NGISplitter {
    event Mint(address indexed from, uint256 wbtcIn, uint256 wethIn, uint256 indexed amount);
    event Burn(address indexed from, uint256 usdcIn, uint256 indexed amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor () {
        _disableInitializers();
    }



    function initialize() public initializer{
        __ERC20_init("Nebula Genesis Index", "NGI");
        __Ownable_init();
        __Pausable_init();
        tokens = [
            0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, //[0] => USDC
            0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6, //[1] => wBTC
            0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619 // [2] => wETH
        ];
        multipliers = [1e12, 1e10, 1];
        marketCapWeigth = [0, 7400, 2600];
        crv = ICurvePool(0x3FCD5De6A9fC8A99995c406c77DDa3eD7E406f81); // CURVE
        uniV3 = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564); // UNISWAPv3
        quick = IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff); //QUICKSWAP
        sushi = IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506); //SUSHISWAP
        bal = IVaultBalancer(0xBA12222222228d8Ba445958a75a0704d566BF2C8); // BALANCER
        addressRouting = [0x3FCD5De6A9fC8A99995c406c77DDa3eD7E406f81, 0xE592427A0AEce92De3Edee1F18E0157C05861564, 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff,0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506, 0xBA12222222228d8Ba445958a75a0704d566BF2C8];
        priceFeeds = [
            AggregatorV3Interface(0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7),
            AggregatorV3Interface(0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6),
            AggregatorV3Interface(0xF9680D99D6C9589e2a93a78A04A279e509205945)
        ];
       

    }

    /**
     * @notice Returns the price of the index
     * wETH/usdc * 0.26 + wBTC/usdc * 0.74
     */
    function getVirtualPrice() public view returns (uint256) {
        return (((getLatestPrice(1) * 7400) / 10000) + ((getLatestPrice(2) * 2600) / 10000));
    }

    /**
     * @notice function to buy 74% wBTC and 26% wETH with usdc
     * @param tokenIn : the token to deposit, must be a component of the index(0,1,2)
     * @param amountIn : token amount to deposit
     * @param optimization: level of slippage optimization, from 0 to 4 
     * @param recipient : recipient of the NGI tokens
     * @return shares : amount of minted tokens
     */
    function deposit(uint8 tokenIn, uint256 amountIn, uint8 optimization, address recipient)
        public
        whenNotPaused
        returns (uint256 shares)
    {
        require(optimization < 5, "optimization >= 5");
        require(tokenIn < 3, "token >=3");
        require(amountIn > 0, "dx=0");
        uint256 dywBtc;
        uint256 dywEth;
        uint8 i = tokenIn;

        TransferHelper.safeTransferFrom(tokens[i], msg.sender, address(this), amountIn);

        (uint256 amountForBtc, uint256 amountForEth) = ((amountIn * 7400) / 10000, (amountIn * 2600) / 10000);

        approveAMM(i, amountIn, optimization + 1);
        dywBtc = swapWithParams(i, 1, amountForBtc, optimization + 1);
        dywEth = swapWithParams(i, 2, amountForEth, optimization + 1);

        _mint(
            recipient,
            shares = ((dywBtc * multipliers[1] * getLatestPrice(1)) + (dywEth * multipliers[2] * getLatestPrice(2)))
                / getVirtualPrice()
        );
        emit Mint(recipient, dywBtc, dywEth, shares);
    }

    /**
     * @notice function to buy 74% wBTC and 26% wETH with usdc choosing a custom AMM split, previously calculated off-chain
     * @param tokenIn : the token to deposit, must be a component of the index(0,1,2)
     * @param amountIn : amount of the token to deposit
     * @param percentagesWBTCSplit : percentages of the token to exchange in each dex to buy WBTC
     * @param percentagesWETHSplit : percentages of the token to exchange in each dex to buy WETH
     * @param recipient : recipient of the NGI tokens
     * @return shares : amount of minted tokens
     */

    function depositCustom(
        uint8 tokenIn,
        uint256 amountIn,
        uint16[5] calldata percentagesWBTCSplit,
        uint16[5] calldata percentagesWETHSplit,
        address recipient
    ) external whenNotPaused returns (uint256 shares) {
        uint8 i = tokenIn;
        require(i < 3);
        require(amountIn > 0, "dx=0");
        require(_getTotal(percentagesWBTCSplit) == 10000 && _getTotal(percentagesWETHSplit) == 10000, "!=100%");
        TransferHelper.safeTransferFrom(tokens[i], msg.sender, address(this), amountIn);

        approveAMM(i, amountIn, 5);
        uint256 amountForBtc = amountIn * 7400 / 10000;
        uint256 amountForEth = amountIn * 2600 / 10000;
        uint256[5] memory splitsForBtc;
        uint256[5] memory splitsForEth;

        for (uint256 index = 0; index < 5;) {
            splitsForBtc[index] = amountForBtc * percentagesWBTCSplit[index] / 10000;
            splitsForEth[index] = amountForEth * percentagesWETHSplit[index] / 10000;
            unchecked {
                ++index;
            }
        }

        uint256 dywBtc = swapWithParamsCustom(i, 1, splitsForBtc);
        uint256 dywEth = swapWithParamsCustom(i, 2, splitsForEth);

        _mint(
            recipient,
            shares = (dywBtc * multipliers[1] * getLatestPrice(1) + dywEth * multipliers[2] * getLatestPrice(2))
                / getVirtualPrice()
        );
        emit Mint(recipient, dywBtc, dywEth, shares);
    }

    /**
     * @notice Function to liquidate wETH and wBTC positions for usdc
     * @param ngiIn : the number of indexed tokens to burn 
     * @param optimization: level of slippage optimization, from 0 to 4
     * @param recipient : recipient of the USDC
     * @return usdcOut : final usdc amount to withdraw after slippage and fees
     */
    function withdrawUsdc(uint256 ngiIn, uint8 optimization, address recipient)
        external
        whenNotPaused
        returns (uint256 usdcOut)
    {
        require(ngiIn > 0, "dx=0");
        require(optimization < 5, "optimization >= 5");

        uint256 balanceWBtc = IERC20(tokens[1]).balanceOf(address(this));
        uint256 balanceWEth = IERC20(tokens[2]).balanceOf(address(this));
        uint256 wBtcIn = balanceWBtc * ngiIn / totalSupply();
        uint256 wEthIn = balanceWEth * ngiIn / totalSupply();

        _burn(msg.sender, ngiIn);
        approveAMM(1, wBtcIn, optimization + 1);
        approveAMM(2, wEthIn, optimization + 1);
        TransferHelper.safeTransfer(
            tokens[0],
            recipient,
            usdcOut = swapWithParams(1, 0, wBtcIn, optimization + 1) + swapWithParams(2, 0, wEthIn, optimization + 1)
        );
        emit Burn(recipient, usdcOut, ngiIn);
    }

    /**
     * @notice Function to liquidate wETH and wBTC positions for usdc
     * @param ngiIn : the number of indexed tokens to burn 
     * @param percentagesWBTCSplit : percentages of the token to exchange in each dex to buy WBTC
     * @param percentagesWETHSplit : percentages of the token to exchange in each dex to buy WETH
     * @param recipient : recipient of the USDC
     * @return usdcOut : final usdc amount to withdraw after slippage and fees
     */

    function withdrawUsdcCustom(
        uint256 ngiIn,
        uint16[5] calldata percentagesWBTCSplit,
        uint16[5] calldata percentagesWETHSplit,
        address recipient
    ) external whenNotPaused returns (uint256 usdcOut) {
        require(ngiIn > 0, "dx=0");
        require(_getTotal(percentagesWBTCSplit) == 10000 && _getTotal(percentagesWETHSplit) == 10000, "!=100%");

        uint256 balanceWBtc = IERC20(tokens[1]).balanceOf(address(this));
        uint256 balanceWEth = IERC20(tokens[2]).balanceOf(address(this));
        uint256 wBtcIn = balanceWBtc * ngiIn / totalSupply();
        uint256 wEthIn = balanceWEth * ngiIn / totalSupply();
        uint256[5] memory btcSplits;
        uint256[5] memory ethSplits;

        for (uint8 index = 0; index < 5;) {
            btcSplits[index] = wBtcIn * percentagesWBTCSplit[index] / 10000;
            ethSplits[index] = wEthIn * percentagesWETHSplit[index] / 10000;
            unchecked {
                ++index;
            }
        }
        _burn(msg.sender, ngiIn);

        approveAMM(1, wBtcIn, 5);
        approveAMM(2, wEthIn, 5);
        TransferHelper.safeTransfer(
            tokens[0],
            recipient,
            usdcOut = swapWithParamsCustom(1, 0, btcSplits) + swapWithParamsCustom(2, 0, ethSplits)
        );
        emit Burn(recipient, usdcOut, ngiIn);
    }

    function _getTotal(uint16[5] memory _params) private pure returns (uint16) {
        uint256 len = _params.length;
        uint16 total = 0;
        for (uint8 i = 0; i < len;) {
            uint16 n = _params[i];
            if (n != 0) {
                total += n;
            }
            unchecked {
                ++i;
            }
        }
        return total;
    }

    //////////////////////////////////
    // SPECIAL PERMISSION FUNCTIONS//
    /////////////////////////////////

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

   
}
