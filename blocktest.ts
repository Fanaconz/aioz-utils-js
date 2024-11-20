import { AiozCoinService } from "./src";
import {
    NodesOptions,
    BalanceByAddressResult, GetBlockResult, TxByHashResult
} from "./src/common";

// for run use  " yarn ts-node blocktest.ts "

void (async function (): Promise<void> {

    const service: AiozCoinService = new AiozCoinService();

    const config: NodesOptions =
        {
            node: {
                url: 'https://eth-dataseed.aioz.network',
                confirmationLimit: 10,
            },
        };

    service.initNodes(config);

    // Height
    const height = async (): Promise<void> => {
        const heightChain: number = await service.nodes[0].getHeight();
        console.log('Height:', heightChain);
    };

    // Balance
    const balance = async (): Promise<void> => {
        const smbBalance: BalanceByAddressResult = await service.nodes[0].balanceByAddress('AIOZ', '0x5ff8d86724037CEdcCd66B12cAa88B32B037055d');
        console.log('Balance:', smbBalance);
    }

    //Block
    const block = async (): Promise<void> => {
        const chainBlock: GetBlockResult = await service.nodes[0].getBlock(15497764);
        console.log('Block:', chainBlock);
    };

    // TxHash
    const txHash = async (): Promise<void> => {
        const smbHash: TxByHashResult = await service.nodes[0].txByHash('AIOZ', '0xbe3befd10efb34bf07660a8379902f317e58f5315a6f7e9f5e90ce4ccea633e6');
        console.log('TxHash:', smbHash);
    }

    try {
        await height();
        await balance();
        await block();
        await txHash();
    } catch (e) {
        console.error(e);
    }

    await new Promise(r => setTimeout(r, 2 * 1000));
}());
