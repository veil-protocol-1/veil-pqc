// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VeilStaking — duration-tracked staking for Veil 2.0
/// @dev No inflationary emissions. Rewards are funded externally by the owner
///      and distributed via rewardRate (tokens-per-second per staked token, scaled 1e18).
///      Emergency withdraw bypasses reward accounting.
contract VeilStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable veilToken;

    /// @dev Reward tokens per second per staked VEIL, scaled by 1e18.
    uint256 public rewardRate;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardDebt; // accumulated rewards already accounted for
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event RewardsFunded(address indexed from, uint256 amount);

    constructor(address initialOwner, address _veilToken) Ownable(initialOwner) {
        veilToken = IERC20(_veilToken);
    }

    /// @notice Deposit VEIL into the staking contract.
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "VeilStaking: zero amount");

        StakeInfo storage info = stakes[msg.sender];

        // Settle any pending rewards before mutating stake
        if (info.amount > 0) {
            uint256 pending = _pendingReward(msg.sender);
            info.rewardDebt += pending;
        }

        require(veilToken.transferFrom(msg.sender, address(this), amount), "VeilStaking: transfer failed");

        info.amount += amount;
        info.stakedAt = info.stakedAt == 0 ? block.timestamp : info.stakedAt;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked VEIL and claim accrued rewards.
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "VeilStaking: insufficient stake");

        uint256 pending = _pendingReward(msg.sender) + info.rewardDebt;
        info.rewardDebt = 0;
        info.amount -= amount;
        totalStaked -= amount;

        if (info.amount == 0) {
            info.stakedAt = 0;
        }

        require(veilToken.transfer(msg.sender, amount), "VeilStaking: stake transfer failed");

        if (pending > 0) {
            uint256 available = veilToken.balanceOf(address(this)) - totalStaked;
            uint256 payout = pending > available ? available : pending;
            if (payout > 0) {
                require(veilToken.transfer(msg.sender, payout), "VeilStaking: reward transfer failed");
            }
        }

        emit Unstaked(msg.sender, amount, pending);
    }

    /// @notice Emergency exit — forfeits any pending rewards.
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        uint256 amount = info.amount;
        require(amount > 0, "VeilStaking: nothing staked");

        info.amount = 0;
        info.stakedAt = 0;
        info.rewardDebt = 0;
        totalStaked -= amount;

        require(veilToken.transfer(msg.sender, amount), "VeilStaking: transfer failed");
        emit EmergencyWithdraw(msg.sender, amount);
    }

    /// @notice Owner updates the reward rate; takes effect immediately on future accruals.
    function setRewardRate(uint256 newRate) external onlyOwner {
        emit RewardRateUpdated(rewardRate, newRate);
        rewardRate = newRate;
    }

    /// @notice Owner funds the reward pool by transferring VEIL to this contract.
    function fundRewards(uint256 amount) external onlyOwner {
        require(veilToken.transferFrom(msg.sender, address(this), amount), "VeilStaking: fund transfer failed");
        emit RewardsFunded(msg.sender, amount);
    }

    /// @notice View pending reward for an address (not including rewardDebt already stored).
    function pendingReward(address user) external view returns (uint256) {
        return _pendingReward(user) + stakes[user].rewardDebt;
    }

    /// @notice Staking duration in seconds for a given address.
    function stakingDuration(address user) external view returns (uint256) {
        if (stakes[user].stakedAt == 0) return 0;
        return block.timestamp - stakes[user].stakedAt;
    }

    function _pendingReward(address user) internal view returns (uint256) {
        StakeInfo storage info = stakes[user];
        if (info.amount == 0 || info.stakedAt == 0 || rewardRate == 0) return 0;
        uint256 duration = block.timestamp - info.stakedAt;
        return (info.amount * rewardRate * duration) / 1e18;
    }
}
