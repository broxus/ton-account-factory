pragma solidity >= 0.6.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./Account.sol";


contract AccountFactory {
    uint256 static public owner;
    TvmCell static public account_code;

    function deploy_(
        uint256 account_owner,
        uint128 account_value
    ) internal returns(address account) {
        account = new Account{
            value: account_value,
            code: account_code,
            pubkey: tvm.pubkey(),
            varInit: {
                owner: account_owner
            }
        }();
    }

    function deploy(
        uint256[] account_owners,
        uint128[] account_values
    ) external returns(address[] accounts) {
        require(msg.pubkey() == owner, 101);
        require(account_owners.length == account_values.length, 102);
        tvm.accept();

        for (uint i=0; i<account_owners.length; i++) {
            address account = deploy_(account_owners[i], account_values[i]);
            accounts.push(account);
        }
    }
}
