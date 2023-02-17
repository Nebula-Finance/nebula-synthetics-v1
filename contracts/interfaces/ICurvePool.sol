// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ICurvePool {
    function get_dy_underlying(uint256 i, uint256 j, uint256 _dx) external view returns (uint256);
    function exchange_underlying(uint256 i, uint256 j, uint256 _dx, uint256 _min_dy) external;
}
