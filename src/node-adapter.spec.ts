import axios from 'axios';
import {AiozNodeAdapter} from "./node-adapter";
// jest.mock('axios'); этот код вызывает ошибку!!

describe('testing the node-adapter', () => {
    let aiozNodeAdapter: AiozNodeAdapter;
    beforeAll(() => {
        aiozNodeAdapter = new AiozNodeAdapter('AIOZ', 'getHeight', 'https://eth-dataseed.aioz.network', 10);
    });



    // mockedAxios.post.mockResolvedValueOnce({ data: { result: expectedHeight } });
    const last_block_height  = 15512320;
    it('checking the correctness of the last block height (successful response)', async () => {
        // const mockedAxios = axios as jest.Mocked<typeof axios>;
        // const actualHeightResponse = await mockedAxios.post('https://eth-dataseed.aioz.network', {
        //     id: 0,
        //     jsonrpc: '2.0',
        //     method: 'eth_blockNumber',
        //     params: [],
        // });
        // const actualHeight = parseInt(actualHeightResponse.data.result, 16);

        const height = await aiozNodeAdapter.getHeight();
        expect(height).toBe(last_block_height);
    });

});