import { AiozCoinService } from "./src";
import {
    NodesOptions,
    BalanceByAddressResult
} from "./src/common";

// for run use  " yarn ts-node blocktest.ts "

void (async function (): Promise<void> {

    const service: AiozCoinService = new AiozCoinService();

    const config: NodesOptions =
        {
            node: {
                url: 'https://fullnode-testnet.bouncebitapi.com/',
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

    try {
        await height();
        await balance();
    } catch (e) {
        console.error(e);
    }

    await new Promise(r => setTimeout(r, 2 * 1000));
}());
