// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VEILNodeRegistry is Ownable {
    mapping(address => uint256) private _stakes;
    mapping(address => bool) private _registered;

    event NodeRegistered(address indexed node, uint256 stakeAmount);
    event NodeDeregistered(address indexed node);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function register(address node, uint256 stakeAmount) external onlyOwner {
        require(node != address(0), "VEILNodeRegistry: zero address");
        require(!_registered[node], "VEILNodeRegistry: already registered");
        _registered[node] = true;
        _stakes[node] = stakeAmount;
        emit NodeRegistered(node, stakeAmount);
    }

    function deregister(address node) external onlyOwner {
        require(_registered[node], "VEILNodeRegistry: not registered");
        _registered[node] = false;
        _stakes[node] = 0;
        emit NodeDeregistered(node);
    }

    function isRegistered(address node) external view returns (bool) {
        return _registered[node];
    }

    function getStake(address node) external view returns (uint256) {
        return _stakes[node];
    }
}
