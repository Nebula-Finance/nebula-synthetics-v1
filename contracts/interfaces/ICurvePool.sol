pragma solidity ^0.8.7;

interface ICurvePool {
   function get_dy_underlying(uint256 i, uint256 j, uint256 dx) external view returns(uint256);
   function exchange_underlying(uint256 i, uint256 j, uint256 dx,uint256 min_dy) external;
}
