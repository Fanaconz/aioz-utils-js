import {
  AdapterType,
  BalanceByAddressResult,
  BaseNodeAdapter, FromParams,
  GetBlockResult,
  GetHeightResult, ToParams, Transaction,
  TxByHashResult, TxStatus,
} from './common';
import { AiozTransactionBroadcastParams, AiozTransactionBroadcastResults } from './types';
import axios from 'axios';
import Big from 'big.js';


/**
 * Класс, который инициализируется в XxxCoinService для выполнения сетевых запросов.
 *
 * Вместо ХХХ указываем тикер.
 * BaseNodeAdapter - это базовый класс который определяет все методы и их типы.
 * @param network - короткое название сети.
 * @param name - Название провайдера, под которого пишется адаптер (NowNodes, GetBlock, Ankr  и тд).
 * @param confirmationLimit - Количество конфирмаций, число блоков которое отсчитывается после транзакции, чтобы считать ее завершенной.
 * @param utxoConfirmationLimit - Опциональное значение, используется только для сетей с utxo. Количество конфирмаций для utxo, число блоков которое отсчитывается после транзакции, чтобы считать ее завершенной.
 */
export class AiozNodeAdapter extends BaseNodeAdapter {
  constructor(
    readonly network: string,
    readonly name: string = 'NN',
    readonly url: string,
    readonly confirmationLimit: number,
    readonly utxoConfirmationLimit?: number,
    readonly type = AdapterType.Node,
  ) {
    super();
  }

  /**
   * Функция, которая возвращается отформатированные данных по hash'у транзакции и тикеру.
   *
   * Стандартная реализация подразумевает сетевой запрос в сеть по hash'у и получение сырых данных из сети. Которые потом форматируются под ответ.
   * 1. Валидация по методу. В данной реализации поддерживаем только дефолтный метод трансфера. От сети к сети этот метод может отличаться, он может быть как дефолтный и заложен сетью, так и выполняться через специализированный контракт.
   * 2. Валидация по тикеру. Транзакции могут быть как токеновые, так и с нативной монетой. В данное реализации интересуют только транзакции нативной монеты.
   * 3. Валидация по статусу.
   *
   * Рекомендуется сделать дополнительный метод "processTransaction" который будет форматировать сырую транзакцию (не приведенную к общему типу) к формату который требуется на выходе TxByHashResult.
   * Если транзакция является batch-транзакцией (одна транзакция, где средства поступают на несколько адресов), то их необходимо разделить на разные транзакции с одним hash'ом.
   *
   * В случая если сеть не btc-like (нет utxo) и processTransaction вернул массив транзакций, то необходимо взять только первую транзакцию. Так как этот метод, в основном, важен только для получения статуса транзакции.
   */
  async txByHash(
    ticker: string,
    hash: string,
  ): Promise<TxByHashResult> {
    const url: string = 'https://eth-dataseed.aioz.network';
    const method:'POST' = 'POST';
    const data = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [hash],
    };
    try {
      const response: any = await this.request<any, typeof data>(method, url, data);
      function calculateValue(valueHex: string): string {
        return new Big(parseInt(valueHex, 16).toString()).div(new Big(10).pow(18)).toString();
      }
      const from: FromParams[] = [{address: response.from, extraId: null,  value: calculateValue(response.value)}];
      const to: ToParams[] = [{address: response.to, extraId: null,  value: calculateValue(response.value)}];
      const status: TxStatus = TxStatus.finished;
      const height: number = parseInt(response.transactionIndex, 16);
      return {hash, ticker, from, to, status, height};
    } catch (error) {
      console.error('Error block:', error);
      throw error;
    }
  }

  /**
   * Функция запроса высоты блокчейна.
   */
  async getHeight(): Promise<GetHeightResult> {
    const url: string = 'https://eth-dataseed.aioz.network';
    const method:'POST' = 'POST';
    const data = {
      id: 0,
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
    };
    try{
      const response: GetHeightResult = await this.request<GetHeightResult, typeof data>(method, url, data);
      const height: GetHeightResult =  parseInt(response.toString(), 16); // or Number(response)
      return height;
    } catch(error) {
      console.error('Error height:', error);
      throw error;
    }
  }

  /**
   * Функция запроса блока и транзакций которые в этом блоке находятся по его высоте.
   */
  async getBlock(
    height: number,
  ): Promise<GetBlockResult> {
    const url: string = `https://eth-dataseed.aioz.network`;
    const method:'POST' = 'POST';
    const data1 = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [height, true],
    };
    try {
      const response: any = await this.request<any, typeof data1>(method, url, data1);
      console.log(response);
      const timestamp: Date = new Date(parseInt(response.timestamp.toString(), 16) * 1000);
      const transactions: Transaction[] = response.transactions.map((tx) => ({
        hash: tx.hash,
        ticker: 'AIOZ',
        from: [
          {
            address: tx.from,
            extraId: null,
            value: new Big(parseInt(tx.value, 16).toString()).div(new Big(10).pow(18)).toString(),
          },
        ],
        to: [
          {
            address: tx.to,
            extraId: null,
            value: new Big(parseInt(tx.value, 16).toString()).div(new Big(10).pow(18)).toString(),
          },
        ],
        status: 'finished',
        height: parseInt(tx.transactionIndex, 16).toString(),
        gas: parseInt(tx.gas, 16).toString(),
        gasPrice: parseInt(tx.gasPrice, 16).toString()
      }));
      const data: Record<string, unknown> = response;
      return{height, timestamp, transactions, data};
    } catch (error) {
      console.error('Error block:', error);
      throw error;
    }
  }

  /**
   * Функция запроса баланса по адресу и тикеру.
   */
  async balanceByAddress(
    ticker: string,
    address: string,
  ): Promise<BalanceByAddressResult> {
    const url: string = 'https://eth-dataseed.aioz.network';
    const method:'POST' = 'POST';
    const data = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [
        address,
        "latest"
      ],
    };
    try {
      const response: number = await this.request<number, typeof data>(method, url, data);
      const totalBalance: string = new Big(parseInt(response.toString(), 16).toString()).div(new Big(10).pow(18)).toString();
      const balance: string = 'not actual (no utxo)'
      return {balance, totalBalance};
    } catch (error) {
      console.error('Error balance:', error);
      throw error;
    }
  }

  /**
   * Функция отправки в сеть подписанной транзакции.
   */
  async txBroadcast(
    ticker: string,
    params: AiozTransactionBroadcastParams,
  ): Promise<AiozTransactionBroadcastResults | { error: string }> {
    return null;
  }

  /**
   * Функция-обертка для выполнения сетевого запроса.
   */
  protected request<T, U>(method: 'POST' | 'GET' | 'PUT' | 'DELETE', url: string, data?: U, headers?: Record<string, string | number>): Promise<T> {
    const isRpcRequest = typeof data === 'object' && data && 'jsonrpc' in data && data.jsonrpc === '2.0';
    const config = {
      method,
      url,
      data: isRpcRequest ? data : undefined,
      headers,
    };
    return axios(config)
        .then((response) => {
          return isRpcRequest ? response.data.result : response.data;
        });
  }
}
