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
    address[3] public  tokens;
    uint40[3] multipliers;
    uint16[3]  marketCapWeigth;
    ICurvePool crv;  // CURVE
    ISwapRouter  uniV3 ; // UNISWAPv3
    IUniswapV2Router02  quick;  //QUICKSWAP
    IUniswapV2Router02  sushi;  //SUSHISWAP
    IVaultBalancer  bal;  // BALANCER
    address[5]  addressRouting;
   

    function swapWithParams(uint8 i, uint8 j, uint256 dx, uint256 split) internal returns (uint256) {
        address _in = tokens[i];
        address _out = tokens[j];

        if (split == 1) {
            return _swapCrv(i, j, dx);
        }
        if (split == 2) {
            return _swapCrv(i, j, dx * 6700 / 10000) + _swapUniV3(_in, _out, dx * 3300 / 10000);
        }
        if (split == 3) {
            return _swapCrv(i, j, dx * 6000 / 10000) + _swapUniV3(_in, _out, dx * 3100 / 10000)
                + _swapQuick(_in, _out, dx * 900 / 10000);
        }
        if (split == 4) {
            return _swapCrv(i, j, dx * 5869 / 10000) + _swapUniV3(_in, _out, dx * 3100 / 10000)
                + _swapQuick(_in, _out, dx * 800 / 10000) + _swapSushi(_in, _out, dx * 231 / 10000);
        }

        return _swapCrv(i, j, dx * 5800 / 10000) + _swapUniV3(_in, _out, dx * 3000 / 10000)
            + _swapQuick(_in, _out, dx * 800 / 10000) + _swapSushi(_in, _out, dx * 264 / 10000)
            + _swapBal(_in, _out, dx * 136 / 10000);
    }
    //case user wants to customize the splits for max efficiency

    function swapWithParamsCustom(uint8 _i, uint8 _j, uint256[5] memory _splits) internal returns (uint256) {
        address _in = tokens[_i];
        address _out = tokens[_j];

        return _swapCrv(_i, _j, _splits[0]) + _swapUniV3(_in, _out, _splits[1]) + _swapBal(_in, _out, _splits[2])
            + _swapSushi(_in, _out, _splits[3]) + _swapQuick(_in, _out, _splits[4]);
    }
    // approval to AMMs, always perform max approval so the contract doesnt need to do it every time

    function approveAMM(uint8 _token, uint256 _amount, uint8 _split) internal {
        uint8 s = _split;
        IERC20 token = IERC20(tokens[_token]);
        for (uint8 i = 0; i < s;) {
            address dex = addressRouting[i];
            if (token.allowance(msg.sender, dex) < _amount) {
                token.approve(dex, 115792089237316195423570985008687907853269984665640564039457584007913129639935);
            }
            unchecked {
                ++i;
            }
        }
    }
    // swap on curve

    function _swapCrv(uint8 _i, uint8 _j, uint256 _dx) private returns (uint256) {
        if (_dx == 0) {
            return 0;
        }
        if (_i == _j) {
            return _dx;
        }
        uint8 iUnderlying = _getUnderlying(_i);
        uint8 jUnderlying = _getUnderlying(_j);
        uint256 dy = crv.get_dy_underlying(iUnderlying, jUnderlying, _dx);
        crv.exchange_underlying(iUnderlying, jUnderlying, _dx, 0);
        return dy;
    }

    // swap oin uniswapv3
    function _swapUniV3(address _i, address _j, uint256 _dx) private returns (uint256) {
        return _dx == 0
            ? 0
            : _i == _j
                ? _dx
                : uniV3.exactInputSingle(
                    ISwapRouter.ExactInputSingleParams(_i, _j, 3000, address(this), block.timestamp, _dx, 0, 0)
                );
    }

    // swap on balancer
    function _swapBal(address _i, address _j, uint256 _dx) private returns (uint256) {
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
        IVaultBalancer.FundManagement memory funds = IVaultBalancer.FundManagement({
            sender: address(this),
            fromInternalBalance: false,
            recipient: payable(address(this)),
            toInternalBalance: false
        });
        return bal.swap(params, funds, 0, block.timestamp);
    }

    //swap on sushi
    function _swapSushi(address _i, address _j, uint256 _dx) private returns (uint256) {
        address[] memory route = new address[](2);
        route[0] = _i;
        route[1] = _j;
        return _dx == 0
            ? 0
            : route[0] == route[1] ? _dx : sushi.swapExactTokensForTokens(_dx, 0, route, address(this), block.timestamp)[1];
    }

    //swap on quickswap
    function _swapQuick(address _i, address _j, uint256 _dx) private returns (uint256) {
        address[] memory route = new address[](2);
        route[0] = _i;
        route[1] = _j;
        return _dx == 0
            ? 0
            : route[0] == route[1] ? _dx : quick.swapExactTokensForTokens(_dx, 0, route, address(this), block.timestamp)[1];
    }

    function _getUnderlying(uint8 n) private pure returns (uint8) {
        return n == 0 ? 1 : n == 1 ? 3 : 4;
    }
}
