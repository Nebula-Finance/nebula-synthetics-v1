// SPDX-License-Identifier: MIT

/**
Created by @Nebula.fi
wBTC-wETH
 */

import "hardhat/console.sol";
pragma solidity ^0.8.7;
import "../../utils/ChainId.sol";
import "./NGISplitter.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GenesisIndex is ERC20, Ownable, Pausable, ChainId, NGISplitter {
    event Mint(
        address indexed from,
        uint256 wbtcIn,
        uint256 wethIn,
        uint256 amount
    );
    event Burn(address indexed from, uint256 usdcIn, uint256 amount);
    
    constructor() ERC20("Nebula Genesis Index", "NGI") {}

    /**
    @notice Returns the price of the index
    wETH/usdc * 0.26 + wBTC/usdc * 0.74
     */
    function getVirtualPrice() public view returns (uint256) {
        return (((getLatestPrice(1) * 7400) / 10000) +
            ((getLatestPrice(2) * 2600) / 10000));
    }

    /**
    @notice function to buy 74% wBTC and 26% wETH with usdc
    @param tokenIn : the token to deposit, must be a component of the index(0,1,2)
    @param amountIn : token amount to deposit
    @param optimization: level of slippage optimization, from 0 to 2 
    @return shares : amount of minted tokens
     */
    function deposit(
        uint256 tokenIn,
        uint256 amountIn,
        uint256 optimization
    ) public whenNotPaused returns (uint256 shares) {
        require(optimization < 6, "optimization >= 6");
        require(tokenIn < 3, "token >=3");
        uint256 dywBtc;
        uint256 dywEth;
        uint256 i = tokenIn;

        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            amountIn
        );
        

        (uint256 amountForBtc, uint256 amountForEth) = (
            (amountIn * 7400) / 10000,
            (amountIn * 2600) / 10000
        );

        approveAMM(i, amountIn, optimization + 1);
        dywBtc = swapWithParams(i, 1, amountForBtc, optimization + 1);
        dywEth = swapWithParams(i, 2, amountForEth, optimization + 1);
        
        _mint(
            msg.sender,
            shares =
                (  (dywBtc * multipliers[1] * getLatestPrice(1)) + (dywEth * multipliers[2] *  getLatestPrice(2))  ) 
                / getVirtualPrice()
        );
        emit Mint(msg.sender, dywBtc, dywEth, shares);
    }

    /**
    @notice function to by 74% wBTC and 26% wETH with usdc choosing a custom AMM split, previously calculated off-chain
    @param tokenIn : the token to deposit, must be a component of the index(0,1,2)
    @param splits : amounts to exchange in each exchange [curve, uniswapv3, uniswapv2, balancer, sushiswap, quickswap]
    @return shares : amount of minted tokens
     */


    function depositCustom(uint256 tokenIn, uint256[5] memory splits)
        external
        whenNotPaused
        returns (uint256 shares)
    {
        uint256 i = tokenIn;
        require(i < 3);
        uint256 t = _getTotal(splits);
        require(tokenIn >= t ,"amount>tokenIn");
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            t
        );
        
        approveAMM(i, t, 5);
        uint256[5] memory splitsForBtc;
        uint256[5] memory splitsForEth;

        for(uint256 index=0; index<5;){
            splitsForBtc[index] = splits[index] * 7400/10000;
            splitsForEth[index] = splits[index] * 2600/10000;
            unchecked {
                ++index;
            }
        }

        uint256 dywBtc = swapWithParamsCustom(i,1, splitsForBtc);
        uint256 dywEth = swapWithParamsCustom(i,2, splitsForEth);

        _mint(
            msg.sender,
            shares =
                (dywBtc * multipliers[1] * getLatestPrice(1) +dywEth * multipliers[2] *  getLatestPrice(2)  ) / getVirtualPrice()
        );
        emit Mint(msg.sender, dywBtc, dywEth, shares);
    }

    /**
    @notice Function to liquidate wETH and wBTC positions for usdc
    @param ngiIn : the number of indexed tokens to burn 
    @param optimization: true to apply slippage optimization, false else
    @dev to calculate the amount of usdc we get after the swap,
    we fetch contract's balance first and after the swap so the difference is 
    the amount gotten after slippage. The fee goes to devs'balance
    @return usdcOut : final usdc amount to withdraw after slippage and 1% fee
     */
    function withdrawUsdc(uint256 ngiIn, uint256 optimization)
        external
        whenNotPaused
        returns (uint256 usdcOut)
    {   
        require(optimization < 5, "optimization >= 5");
        _burn(msg.sender, ngiIn);
        uint256 usdcIn = getVirtualPrice() * ngiIn;
        uint256 wBtcIn = (usdcIn * 7400 / 10000) / getLatestPrice(1) /multipliers[1];
        uint256 wEthIn = (usdcIn * 2600 / 10000) / getLatestPrice(2) /multipliers[2];
        approveAMM(1, wBtcIn, optimization + 1);
        approveAMM(2, wEthIn, optimization + 1);
        TransferHelper.safeTransfer(
            tokens[0],
            msg.sender,
            usdcOut = swapWithParams(1, 0, wBtcIn, optimization + 1) + swapWithParams(2, 0, wEthIn, optimization + 1)
        );
        emit Burn(msg.sender, usdcOut, ngiIn);
    }

    function withdrawUsdcCustom(uint256 ngiIn, uint256[5] memory splitswBtc, uint256[5] memory splitswEth) 
        external 
        whenNotPaused 
        returns(uint256 usdcOut)
    {
        uint256 usdcIn = getVirtualPrice() * ngiIn;
        uint256 wBtcIn = (usdcIn * 7400 / 10000) / getLatestPrice(1) /multipliers[1];
        uint256 wEthIn = (usdcIn * 2600 / 10000) / getLatestPrice(2) /multipliers[2];
        require(_getTotal(splitswBtc) <= wBtcIn && _getTotal(splitswEth) <= wEthIn, "invalid amount");
        _burn(msg.sender, ngiIn);
        approveAMM(1, wBtcIn, 6);
        approveAMM(1, wEthIn, 6);
        TransferHelper.safeTransfer(
            tokens[0],
            msg.sender,
            usdcOut = swapWithParamsCustom(1, 0, splitswBtc) + swapWithParamsCustom(2, 0, splitswEth)
        );
        emit Burn(msg.sender, usdcOut, ngiIn);
    }

    function _getTotal(uint256[5] memory _params)
        internal
        pure
        returns (uint256)
    {
        uint256 len = _params.length;
        uint256 total = 0;
        for (uint256 i = 0; i < len; i++) {
            uint256 n = _params[i];
            if (n != 0) {
                total += n;
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

   

    /////////////////////

    //ONLY FOR TESTING
    function test_uni_v3(
        uint256 i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            dx
        );
        approveAMM(i, dx, 5);
        uint256 dy = _swapUniV3(tokens[i], tokens[j], dx);
        console.log(dy);
        TransferHelper.safeTransfer(tokens[j], msg.sender, dy);
    }

  
     function test_quick(
        uint256 i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            dx
        );
        approveAMM(i, dx, 5);
        uint256 dy = _swapQuick(tokens[i], tokens[j], dx);
        console.log(dy);
        TransferHelper.safeTransfer(tokens[j], msg.sender, dy);
    }


    function test_sushi(
        uint256 i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            dx
        );
        approveAMM(i, dx, 5);
        uint256 dy = _swapSushi(tokens[i], tokens[j], dx);
        console.log(dy);
        TransferHelper.safeTransfer(tokens[j], msg.sender,dy);
    }

    function test_balancer(
        uint256 i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            dx
        );
        approveAMM(i, dx, 5);
        uint256 dy = _swapBal(tokens[i], tokens[j], dx);
        console.log(dy);
        TransferHelper.safeTransfer(tokens[j], msg.sender, dy);
    }


    function test_curve(
        uint256 i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            tokens[i],
            msg.sender,
            address(this),
            dx
        );
        approveAMM(i, dx, 5);
        uint256 dy = _swapCrv(i, j, dx);
        console.log(dy);
        TransferHelper.safeTransfer(tokens[j], msg.sender, dy);
    }

    function test_swap(
        address i ,
        uint256 j,
        uint256 dx
    ) external {
        TransferHelper.safeTransferFrom(
            i,
            msg.sender,
            address(this),
            dx
        );
        TransferHelper.safeApprove(i, address(uniV3), dx);
        uint256 dy =  uniV3.exactInputSingle(
                    ISwapRouter.ExactInputSingleParams(
                        i,
                        tokens[j],
                        3000,
                        address(this),
                        block.timestamp,
                        dx,
                        0,
                        0
                    )
                );
        TransferHelper.safeTransfer(tokens[j], msg.sender, dy);
    }

   

  
   
}
