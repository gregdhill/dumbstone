import { Signable, Expirable } from './agreement';
import { Client } from '../client';
import assert from 'assert';

function sleep(sec: number) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

describe('assembled agreements', function () {
  it('should validate from components', async () => {
    const buyer = new Client('localhost:10997', '7D4ECA0E7E289B1DF41DFEEBE15AF7EB34B80CFF');
    const seller = new Client('localhost:10997', 'F2C97B55C6FB209B19B08C9095F45422BA2BF1D6');
    
    const address1 = await Expirable.Deploy(buyer, '', [seller.account], Math.floor(Date.now()/1000)+2);
    const address2 = await Signable.Deploy(buyer, address1, [seller.account]);
  
    let signatures = new Signable.Contract(buyer, address2);
    assert.equal(await signatures.done().then(data => data[0]), false);
    signatures = new Signable.Contract(seller, address2);
    await signatures.sign()
    assert.equal(await signatures.done().then(data => data[0]), true);
  
    await sleep(6);
    assert.equal(await signatures.done().then(data => data[0]), false);
  }).timeout(10000);
})
