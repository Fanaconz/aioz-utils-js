import {AiozNodeAdapter} from "./node-adapter";

describe(
    'testing the node-adapter', async () => {
        const last_block_height  = 14605610;
        it('checking the correctness of the last block height (successful response)', async () => {
            const aiozNodeAdapter = new AiozNodeAdapter('AIOZ', 'getHeight', 'https://rpc-ds.testnet.aioz.network', 10)
            expect(aiozNodeAdapter.getHeight()).toBe(last_block_height);
        });

    });
