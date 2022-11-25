// SPDX-License-Identifier: MIT

/**
Created by @Nebula.fi
wBTC-wETH
 */

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
    uint256 public devBalance;
    address[] public devs;

    modifier onlyDevs() {
        bool found;
        for (uint256 i = 0; i < devs.length; i++) {
            if (devs[i] == msg.sender) found = true;
        }
        require(found, "You dont have permission");
        _;
    }

    /**
    @param _devs : Addreses with access to the devs' funds.
     */
    constructor(address[] memory _devs) ERC20("Nebula Genesis Index", "NGI") {
        for (uint256 i = 0; i < _devs.length; i++) {
            devs.push(_devs[i]);
        }
    }

    /**
    @notice Returns the price of the index
    wETH/usdc * 0.26 + wBTC/usdc * 0.74
     */
    function getVirtualPrice() public view returns (uint256) {
        // devuelve el precio del indice usando oraculos
        return (((getLatestPrice(1) * 7400) / 10000) +
            ((getLatestPrice(2) * 2600) / 10000));
    }

    /**
    @notice function to by 74% wBTC and 26% wETH with usdc
    @param tokenIn : the token to deposit, must be a component of the index(0,1,2)
    @param amountIn : token amount to deposit
    @param optimization: level of slippage optimization, from 0 to 2 
    @return shares : amount of minted tokens
     */
    function deposit(
        uint256 tokenIn,
        uint256 amountIn,
        uint256 optimization
    ) public payable whenNotPaused returns (uint256 shares) {
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

        approveAMM(i, amountForBtc + amountForEth, optimization + 1);

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

    function depositCustom(uint256 tokenIn, uint256[5] calldata splits, bool useEth)
        external
        payable
        returns (uint256 shares)
    {
        require(msg.value == 0, "msgvalue");
        uint256 i = tokenIn;
        require(i < 3);
        uint256 t = _getTotal(splits);
        if (useEth) {
            require(tokenIn == 2, "Params");
            require(t == msg.value, "i!=eth");
            (bool success, ) = tokens[2].call{value: t}(
                abi.encodeWithSignature("deposit(uint256)", t)
            );
            require(success, "wethDeposit");
        } else {
            TransferHelper.safeTransferFrom(
                tokens[i],
                msg.sender,
                address(this),
                t
            );
        }
        approveAMM(i, t, 3);
        (uint256 dywBtc, uint256 dywEth) = swapWithCustomParams(i, splits);
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
    @param optimizer: true to apply slippage optimization, false else
    @dev to calculate the amount of usdc we get after the swap,
    we fetch contract's balance first and after the swap so the difference is 
    the amount gotten after slippage. The fee goes to devs'balance
    @return usdcOut : final usdc amount to withdraw after slippage and 1% fee
     */
    function withdrawusdc(uint256 ngiIn, uint256 optimizer)
        external
        payable
        whenNotPaused
        returns (uint256 usdcOut)
    {
        _burn(msg.sender, ngiIn);
        uint256 usdcIn = getVirtualPrice() * ngiIn;
        uint256 wBtcIn = usdcIn * 7400 / 10000 / getLatestPrice(1) /multipliers[1];
        uint256 wEthIn = (usdcIn * 2600 / 10000) / getLatestPrice(2) /multipliers[2];
        TransferHelper.safeTransferFrom(
            tokens[0],
            address(this),
            msg.sender,
            usdcOut = swapWithParams(1, 0, wBtcIn, optimizer + 1) + swapWithParams(2, 0, wEthIn, optimizer + 1)
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

    function withdrawFeeProfit(uint256 amount) external onlyDevs {
        require(amount <= devBalance, "DEV_WITHDRAW_FAILED");
        uint256 split = devBalance / devs.length;
        require(split > 0, "DEV_SPLIT_IS_ZERO");
        IERC20 token0 = IERC20(tokens[0]);
        for (uint256 i = 0; i < devs.length; i++) {
            token0.transfer(devs[i], split);
        }
        devBalance -= amount;
    }

    /////////////////////

    //Solo para los tests para cambiar weth por usdc
    function test_uni(
        address i ,
        uint256 j,
        uint256 dx
    ) external payable {
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
