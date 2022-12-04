// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
pragma abicoder v2;
import "../../lib/TransferHelper.sol";
import "../../interfaces/ISwapRouter.sol";
import {IAsset} from "../../interfaces/IVaultBalancer.sol";
import {IVaultBalancer} from "../../interfaces/IVaultBalancer.sol";
import "../../interfaces/IUniswapV2Router02.sol";
import "../../interfaces/ICurvePool.sol";
import "./PriceConsumerNGI.sol";

contract NGISplitter is PriceConsumerNGI {
    mapping(uint256 => address) private addressRouting;
    address[3] public tokens = [
        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, //[0] => USDC
        0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6, //[1] => wBTC
        0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619 // [2] => wETH
    ];
    uint40[3] multipliers = [1e12, 1e10, 1];
    uint16[3] marketCapWeigth = [0, 7400, 2600];


    ICurvePool constant crv = 
        ICurvePool(0x3FCD5De6A9fC8A99995c406c77DDa3eD7E406f81); // CURVE pool

    ISwapRouter constant uniV3 =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564); // UNISWAPv3 router

    IVaultBalancer constant bal =
        IVaultBalancer(0xBA12222222228d8Ba445958a75a0704d566BF2C8); // BALANCER router

    IUniswapV2Router02 constant sushi = 
        IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506) ;//SUSHISWAP router

    IUniswapV2Router02 constant quick = 
        IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff); //UNISWAPv2 router

    constructor() {
        addressRouting[0] = address(crv);
        addressRouting[1] = address(uniV3);
        addressRouting[2] = address(bal);
        addressRouting[3] = address(sushi);
        addressRouting[4] = address(quick);
    }

    function swapWithParams(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 split
    ) internal returns (uint256) {
        address _in = tokens[i];
        address _out = tokens[j];

        if(split ==1){
            return _swapCrv(i, j, dx);
        }
        if (split == 2) {
            return _swapCrv(i, j, dx / 2) 
            + _swapUniV3(_in, _out, dx / 2);
        }
        if (split == 3) {
            return _swapCrv(i, j, dx / 3) 
            + _swapUniV3(_in, _out, dx / 3) 
            + _swapBal(_in, _out, dx / 3);
            
        }
        if (split == 4) {
            return _swapCrv(i, j, dx / 4)  
            + _swapUniV3(_in, _out,dx / 4) 
            + _swapBal(_in, _out, dx / 4)
            + _swapSushi(_in, _out, dx / 4);
        }

        return _swapCrv(i, j, dx / 5) 
        + _swapUniV3(_in, _out, dx / 5) 
        + _swapBal(_in, _out, dx / 5) 
        + _swapSushi(_in, _out, dx / 5)
        + _swapQuick(_in, _out , dx / 5);
    }

    function swapWithParamsCustom(uint256 _i, uint256 _j,  uint256[5] memory _splits)
        internal
        returns (uint256)
    {
        address _in = tokens[_i];
        address _out = tokens[_j];

        return _swapCrv(_i, _j, _splits[0]) 
        + _swapUniV3(_in, _out, _splits[1]) 
        + _swapBal(_in, _out, _splits[2]) 
        + _swapSushi(_in, _out, _splits[3]) 
        + _swapQuick(_in, _out , _splits[4]);
        
    }

    function approveAMM(
        uint256 _token,
        uint256 _amount,
        uint256 _split
    ) internal {
        uint256 s = _split;
        address token = tokens[_token];
        for (uint256 i = 0; i < s;) {
            TransferHelper.safeApprove(token, addressRouting[i], _amount);
            unchecked {
                ++i;
            }
        }
    }
    // swap on curve
    function _swapCrv(
        uint256 _i,
        uint256 _j,
        uint256 _dx
    )internal returns(uint256){
        if(_dx == 0 ){
            return 0;
        }
        if(_i == _j){
            return _dx;
        }
        uint256 iUnderlying = _getUnderlying(_i);
        uint256 jUnderlying = _getUnderlying(_j);
        uint256 dy = crv.get_dy_underlying(iUnderlying, jUnderlying, _dx);
        crv.exchange_underlying(iUnderlying, jUnderlying , _dx, 0);
        return dy;
        
    }

    // swap oin uniswapv3
    function _swapUniV3(
        address _i,
        address _j,
        uint256 _dx
    ) internal returns (uint256) {
        return
            _dx == 0 ? 0 
            : _i == _j ? _dx
            : uniV3.exactInputSingle(
                    ISwapRouter.ExactInputSingleParams(
                        _i,
                        _j,
                        3000,
                        address(this),
                        block.timestamp,
                        _dx,
                        0,
                        0
                    )
                );
    }

    // swap on balancer
    function _swapBal(
        address _i,
        address _j,
        uint256 _dx
    ) internal returns (uint256) {
        if (_i == _j) {
            return _dx;
        }
        if (_dx == 0) {
            return 0;
        }
        IVaultBalancer.SingleSwap memory params = IVaultBalancer.SingleSwap({
            poolId: 0x03cd191f589d12b0582a99808cf19851e468e6b500010000000000000000000a,
            kind: IVaultBalancer.SwapKind.GIVEN_IN,
            assetIn: IAsset(_i),
            assetOut: IAsset(_j),
            amount: _dx,
            userData: ""
        });
        IVaultBalancer.FundManagement memory funds = IVaultBalancer
            .FundManagement({
                sender: address(this),
                fromInternalBalance: false,
                recipient: payable(address(this)),
                toInternalBalance: false
            });
        return bal.swap(params, funds, 0, block.timestamp);
    }



    function _swapSushi(
        address _i,
        address _j,
        uint256 _dx
    ) internal returns (uint256){
        address[] memory route = new address[](2);
        route[0] = _i;
        route[1] = _j;
        return
         _dx == 0 ? 0 
        : route[0] == route[1] ? _dx
        : sushi.swapExactTokensForTokens(_dx,0, route , address(this), block.timestamp)[1];
    }



    //swap on quickswap
    function _swapQuick(
        address _i,
        address _j,
        uint256 _dx
    ) internal returns (uint256){
        address[] memory route = new address[](2);
        route[0] = _i;
        route[1] = _j;
       return
         _dx == 0 ? 0 
        : route[0] == route[1] ? _dx
        : sushi.swapExactTokensForTokens(_dx,0, route , address(this), block.timestamp)[1];
    }

    

    function _getUnderlying(uint256 n) internal pure returns(uint256){
        if(n==0){
            return 1;
        }
        if(n==1){
            return 3;
        }
        if(n==2){
            return 4;
        }
    }


}
