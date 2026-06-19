// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VEILVesting is Ownable {
    IERC20 public immutable token;
    address public immutable beneficiary;
    uint256 public immutable amount;
    uint256 public immutable startTime;
    uint256 public immutable cliffDuration;
    uint256 public immutable vestingDuration;
    bool public immutable revocable;

    uint256 public released;
    bool public revoked;

    event Released(uint256 amount);
    event Revoked();

    constructor(
        address initialOwner,
        address _token,
        address _beneficiary,
        uint256 _amount,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        bool _revocable
    ) Ownable(initialOwner) {
        require(_beneficiary != address(0), "VEILVesting: zero beneficiary");
        require(_vestingDuration > 0, "VEILVesting: zero duration");
        require(_amount > 0, "VEILVesting: zero amount");
        token = IERC20(_token);
        beneficiary = _beneficiary;
        amount = _amount;
        startTime = _startTime;
        cliffDuration = _cliffDuration;
        vestingDuration = _vestingDuration;
        revocable = _revocable;
    }

    function release() external {
        uint256 releasable = vestedAmount() - released;
        require(releasable > 0, "VEILVesting: nothing to release");
        released += releasable;
        require(token.transfer(beneficiary, releasable), "VEILVesting: transfer failed");
        emit Released(releasable);
    }

    function revoke() external onlyOwner {
        require(revocable, "VEILVesting: not revocable");
        require(!revoked, "VEILVesting: already revoked");
        uint256 releasable = vestedAmount() - released;
        if (releasable > 0) {
            released += releasable;
            require(token.transfer(beneficiary, releasable), "VEILVesting: transfer failed");
        }
        uint256 remainder = token.balanceOf(address(this));
        revoked = true;
        if (remainder > 0) {
            require(token.transfer(owner(), remainder), "VEILVesting: return failed");
        }
        emit Revoked();
    }

    function vestedAmount() public view returns (uint256) {
        if (revoked) return released;
        uint256 cliff = startTime + cliffDuration;
        if (block.timestamp < cliff) return 0;
        if (block.timestamp >= startTime + vestingDuration) return amount;
        return (amount * (block.timestamp - startTime)) / vestingDuration;
    }
}
