const logger = require('mocha-logger');
const BigNumber = require('bignumber.js');
BigNumber.config({ EXPONENTIAL_AT: 257 });
const { expect } = require('chai');


describe('Test factory and accounts', async function() {
  this.timeout(20000);

  const accounts = 10;
  
  let factory;
  let account_keys = [];
  let account_values = [];

  describe('Test factory', async function() {
    it(`Prepare ${accounts} accounts`, async function() {
      account_keys = await Promise
        .all([...Array(accounts)].map(i => locklift.ton.client.crypto.generate_random_sign_keys()));
      account_values = Array(accounts).fill(locklift.utils.convertCrystal(1, 'nano'));
    });
  
    it('Deploy factory', async function() {
      const factoryKeys = await locklift.ton.client.crypto.generate_random_sign_keys();
    
      const Factory = await locklift.factory.getContract('AccountFactory');
      const Account = await locklift.factory.getContract('Account');
    
      factory = await locklift.giver.deployContract({
        contract: Factory,
        constructorParams: {},
        initParams: {
          owner: `0x${factoryKeys.public}`,
          account_code: Account.code,
        },
        keyPair: factoryKeys,
      }, locklift.utils.convertCrystal(20, 'nano'));
    
      factory.setKeyPair(factoryKeys);
    
      logger.log(`Factory address: ${factory.address}`);
    });
  
    it(`Deploy ${accounts} accounts`, async function() {
      await factory.run({
        method: 'deploy',
        params: {
          account_owners: account_keys.map((key) => `0x${key.public}`),
          account_values,
        }
      })
    });
  
    it('Check accounts deployed', async function() {
      const accounts = await factory.call({
        method: 'deploy',
        params: {
          account_owners: account_keys.map((key) => `0x${key.public}`),
          account_values,
        }
      });
    
      expect(accounts).to.have.lengthOf(10, 'Wrong amount of deployed accounts');
    
      for (const [i, account] of accounts.entries()) {
        logger.log(`Account #${i} - ${account}`);
      
        const accountBalance = locklift.utils.convertCrystal(
          (await locklift.ton.getBalance(account)),
          'ton'
        ).toNumber();
      
        expect(accountBalance).to.be.above(0.9).and.to.be.below(1, 'Wrong account balance');
      }
    });
  });
  
  describe('Check account', async function() {
    // Send value from first to second account
    let sender, receiver;
    let account;

    it('Check sending tx from account', async function() {
      [sender, receiver] = await factory.call({
        method: 'deploy',
        params: {
          account_owners: account_keys.map((key) => `0x${key.public}`),
          account_values,
        }
      });
      const [account_key] = account_keys;
    
      logger.log(`Sending value from ${sender} to ${receiver}`);
    
      account = await locklift.factory.getContract('Account');
      account.setAddress(sender);
      account.setKeyPair(account_key);
    
      const tx = await account.run({
        method: 'sendTransaction',
        params: {
          dest: receiver,
          value: locklift.utils.convertCrystal(0.5, 'nano'),
          bounce: true,
          flags: 0,
          payload: ''
        }
      });
    
      logger.log(`Transaction: ${tx.transaction.id}`);
    });

    it('Check sender and receiver balances', async function() {
      expect(
        locklift.utils.convertCrystal(
          (await locklift.ton.getBalance(sender)),
          'ton'
        ).toNumber()
      ).to.be.above(0.1).and.to.be.below(0.5, 'Wrong sender balance');
  
      expect(
        locklift.utils.convertCrystal(
          (await locklift.ton.getBalance(receiver)),
          'ton'
        ).toNumber()
      ).to.be.above(1).and.to.be.below(1.5, 'Wrong receiver balance');
    });
  });
});
