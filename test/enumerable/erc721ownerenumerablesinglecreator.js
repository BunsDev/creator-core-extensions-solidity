const truffleAssert = require('truffle-assertions');
const ERC721Creator = artifacts.require('MockTestERC721Creator');
const ERC721OwnerEnumerableSingleCreatorExtension = artifacts.require("MockERC721OwnerEnumerableSingleCreatorExtension");
const MockERC721 = artifacts.require('MockTestERC721');
const MockERC1155 = artifacts.require('MockTestERC1155');

contract('ERC721OwnerEnumerableSingleCreatorExtension', function ([creator, ...accounts]) {
    const name = 'Token';
    const symbol = 'NFT';
    const minter = creator;
    const [
           owner,
           another1,
           another2,
           another3,
           ] = accounts;

    describe('ERC721OwnerEnumerableSingleCreatorExtension', function() {
        var creator;
        var enumerable;
        var mock721;
        var mock1155;
        var redemptionRate = 3;
        var redemptionMax = 2;

        beforeEach(async function () {
            creator = await ERC721Creator.new(name, symbol, {from:owner});
            enumerable = await ERC721OwnerEnumerableSingleCreatorExtension.new(creator.address, {from:owner});
            await creator.registerExtension(enumerable.address, "https://enumerable", {from:owner});
            await enumerable.setApproveTransfer(creator.address, true, {from:owner});
            mock721 = await MockERC721.new('721', '721', {from:owner});
            mock1155 = await MockERC1155.new('1155uri', {from:owner});
        });

        it('enumeration test', async function () {
            await enumerable.testMint(another1);
            await enumerable.testMint(another2);
            await enumerable.testMint(another2);
            await enumerable.testMint(another3);
            await enumerable.testMint(another3);
            await enumerable.testMint(another3);

            let balance1 = await enumerable.balanceOf(another1);
            let balance2 = await enumerable.balanceOf(another2);
            let balance3 = await enumerable.balanceOf(another3);

            assert.equal(balance1, 1);
            assert.equal(balance2, 2);
            assert.equal(balance3, 3);

            let tokens1 = [];
            let tokens2 = [];
            let tokens3 = [];
            for (let i = 0; i < balance1; i++) {
                tokens1.push(await enumerable.tokenOfOwnerByIndex(another1, i));
            }
            for (let i = 0; i < balance2; i++) {
                tokens2.push(await enumerable.tokenOfOwnerByIndex(another2, i));
            }
            for (let i = 0; i < balance3; i++) {
                tokens3.push(await enumerable.tokenOfOwnerByIndex(another3, i));
            }
            assert.equal(tokens1[0], 1);
            assert.equal(tokens2[0], 2);
            assert.equal(tokens2[1], 3);
            assert.equal(tokens3[0], 4);
            assert.equal(tokens3[1], 5);
            assert.equal(tokens3[2], 6);

            // Transfer
            await creator.transferFrom(another3, another1, 5, {from:another3});

            balance1 = await enumerable.balanceOf(another1);
            balance2 = await enumerable.balanceOf(another2);
            balance3 = await enumerable.balanceOf(another3);

            assert.equal(balance1, 2);
            assert.equal(balance2, 2);
            assert.equal(balance3, 2);

            tokens1 = [];
            tokens2 = [];
            tokens3 = [];
            for (let i = 0; i < balance1; i++) {
                tokens1.push(await enumerable.tokenOfOwnerByIndex(another1, i));
            }
            for (let i = 0; i < balance2; i++) {
                tokens2.push(await enumerable.tokenOfOwnerByIndex(another2, i));
            }
            for (let i = 0; i < balance3; i++) {
                tokens3.push(await enumerable.tokenOfOwnerByIndex(another3, i));
            }
            assert.equal(tokens1[0], 1);
            assert.equal(tokens1[1], 5);
            assert.equal(tokens2[0], 2);
            assert.equal(tokens2[1], 3);
            assert.equal(tokens3[0], 4);
            assert.equal(tokens3[1], 6);

            // Burn
            await creator.burn(2, {from:another2});
            balance1 = await enumerable.balanceOf(another1);
            balance2 = await enumerable.balanceOf(another2);
            balance3 = await enumerable.balanceOf(another3);

            assert.equal(balance1, 2);
            assert.equal(balance2, 1);
            assert.equal(balance3, 2);

            tokens1 = [];
            tokens2 = [];
            tokens3 = [];
            for (let i = 0; i < balance1; i++) {
                tokens1.push(await enumerable.tokenOfOwnerByIndex(another1, i));
            }
            for (let i = 0; i < balance2; i++) {
                tokens2.push(await enumerable.tokenOfOwnerByIndex(another2, i));
            }
            for (let i = 0; i < balance3; i++) {
                tokens3.push(await enumerable.tokenOfOwnerByIndex(another3, i));
            }
            assert.equal(tokens1[0], 1);
            assert.equal(tokens1[1], 5);
            assert.equal(tokens2[0], 3);
            assert.equal(tokens3[0], 4);
            assert.equal(tokens3[1], 6);


        });

    });

});