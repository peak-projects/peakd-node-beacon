import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as hive from '@hiveio/hive-js';
import { ConfigService } from '@nestjs/config';
import { QuotesService } from '../quotes/quotes.service';

const HIVE_CHAIN_ID = 'beeab0de00000000000000000000000000000000000000000000000000000000';

const nodes = [
  { name: 'api.hive.blog', endpoint: 'https://api.hive.blog' },
  { name: 'anyx.io', endpoint: 'https://anyx.io' },
  { name: 'api.hivekings.com', endpoint: 'https://api.hivekings.com' },
  { name: 'api.deathwing.me', endpoint: 'https://api.deathwing.me' },
  { name: 'api.openhive.network', endpoint: 'https://api.openhive.network' },
  { name: 'api.pharesim.me', endpoint: 'https://api.pharesim.me' },
  { name: 'hive.roelandp.nl', endpoint: 'https://hive.roelandp.nl' },
  { name: 'hived.privex.io', endpoint: 'https://hived.privex.io' },
  { name: 'rpc.ausbit.dev', endpoint: 'https://rpc.ausbit.dev' },
  { name: 'hive-api.arcange.eu', endpoint: 'https://hive-api.arcange.eu' },
  { name: 'fin.hive.3speak.co', endpoint: 'https://fin.hive.3speak.co' }
];

const tests = [
  {
    name: 'get_version',
    type: 'fetch',
    method: 'database_api.get_version',
    params: {},
    score: 50,
    debug: false,
    validator: (result) => {
      return result.chain_id === HIVE_CHAIN_ID
    }
  },
  {
    name: 'dynamic_global_properties',
    type: 'fetch',
    method: 'database_api.get_dynamic_global_properties',
    params: {},
    score: 15,
    debug: false,
    validator: (result) => {
      return 'head_block_number' in result && 'hbd_interest_rate' in result
    }
  },
  {
    name: 'feed_history',
    type: 'fetch',
    method: 'database_api.get_feed_history',
    params: {},
    score: 15,
    debug: false,
  },
  {
    name: 'get_accounts',
    type: 'fetch',
    method: 'call',
    params: ['database_api', 'get_accounts', [['peakd']]],
    score: 15,
    debug: false,
    validator: (result) => {
      return Array.isArray(result) && result.length === 1
    }
  },
  {
    name: 'get_ranked_by_created',
    type: 'fetch',
    method: 'bridge.get_ranked_posts',
    params: { tag: '', sort: 'created', limit: 25 },
    score: 25,
    debug: false,
    validator: (result) => {
      const minTimestamp = new Date().getTime() - (1000 * 60 * 5);
      const minDate = new Date();
      minDate.setTime(minTimestamp);
      const fiveMinuteAgoString = (minDate.toISOString()).split('.')[0]

      return Array.isArray(result) && result.length === 25 && result[0].created > fiveMinuteAgoString
    }
  },
  {
    name: 'get_ranked_by_trending',
    type: 'fetch',
    method: 'bridge.get_ranked_posts',
    params: { tag: '', sort: 'trending', limit: 25 },
    score: 15,
    debug: false,
  },
  {
    name: 'get_account_posts_by_blog',
    type: 'fetch',
    method: 'bridge.get_account_posts',
    params: { account: '$', sort: 'blog', limit: 25 },
    score: 15,
    debug: false,
  },
  {
    name: 'get_account_posts_by_feed',
    type: 'fetch',
    method: 'bridge.get_account_posts',
    params: { account: '$', sort: 'feed', limit: 25 },
    score: 15,
    debug: false,
  },
  {
    name: 'get_account_posts_by_replies',
    type: 'fetch',
    method: 'bridge.get_account_posts',
    params: { account: '$', sort: 'replies', limit: 25 },
    score: 15,
    debug: false,
  },
  {
    name: 'custom_json',
    type: 'cast',
    method: 'custom_json',
    params: { id: 'beacon_custom_json', json: JSON.stringify({ ping: 'pong' }), required_auths: [], required_posting_auths: [] },
    score: 15,
    debug: false,
  },
  {
    name: 'transfer',
    type: 'cast',
    method: 'transfer',
    params: { from: '$', to: '$', amount: '1.000 HIVE', memo: '$' },
    score: 15,
    debug: false,
  },
];

export type NodeTestResult = {
  name: string;
  type: string;
  method: string;
  success: boolean;
};

export type NodeStatus = {
  name: string;
  endpoint: string;
  score: number;
  tests: NodeTestResult[]
};

@Injectable()
export class ScannerService implements OnModuleInit {

  private readonly logger = new Logger(ScannerService.name);

  private store: NodeStatus[] = [];

  constructor(private configService: ConfigService, private quotesService: QuotesService) {}

  async onModuleInit(): Promise<void> {
    await this.scan();
  }

  getNodes(): NodeStatus[] {
    return this.store;
  }

  @Cron('0 */5 * * * *')
  async scan(): Promise<boolean> {
    const store: NodeStatus[] = [];
    const maxScore: number = tests.reduce((acc, cur) => { return acc + cur.score }, 0);

    try {
      this.logger.log('Starting node scanner ...');

      for (const node of nodes) {
        this.logger.log(`Switching node to: ${node.name}`);
        hive.api.setOptions({ url: node.endpoint })

        let score: number = maxScore;
        let results: NodeTestResult[] = [];
        for (const test of tests) {
          try {
            if (test.type === 'fetch') {
              const params = 'account' in test.params ? { ...test.params, account: 'peakd' } : test.params;

              this.logger.log(`Call '${test.name}', params: ${JSON.stringify(params)}: ...`);

              const start = Date.now();
              const result = await hive.api.callAsync(test.method, params);
              if (test.debug) {
                this.logger.debug(`Call result: ${JSON.stringify(result)}`);
              }

              const success = test.validator ? test.validator(result) : true
              const elapsed = Date.now() - start;

              if (success) {
                this.logger.log(`Call '${test.name}', completed in ${elapsed} ms`);
                results.push({
                  name: test.name,
                  type: test.type,
                  method: test.method,
                  success: true
                });
              } else {
                this.logger.warn(`Call '${test.name}', failed in ${elapsed} ms`);
                score -= test.score;
                results.push({
                  name: test.name,
                  type: test.type,
                  method: test.method,
                  success: false
                });
              }
            }
            else if (test.type === 'cast') {
              const account = this.configService.get<string>('BEACON_ACCOUNT');
              const postingKey = this.configService.get<string>('BEACON_ACCOUNT_POSTING_KEY');
              const activeKey = this.configService.get<string>('BEACON_ACCOUNT_ACTIVE_KEY');

              const start = Date.now();
              let result = null;
              if (test.method === 'custom_json') {
                const params = { ...test.params, required_posting_auths: [account] };

                this.logger.log(`Cast '${test.name}', params: ${JSON.stringify(params)}: ...`);
                result = await hive.broadcast.sendAsync({ operations: [[test.method, params]], extensions: [] }, { posting: postingKey.trim() })
              } else if (test.method === 'transfer') {
                const params = { ...test.params, from: account, to: account, memo: this.quotesService.getRandomQuote() };

                this.logger.log(`Cast '${test.name}', params: ${JSON.stringify(params)}: ...`);
                result = await hive.broadcast.sendAsync({ operations: [[test.method, params]], extensions: [] }, { active: activeKey.trim() })
              } else {
                throw new Error(`Unsupported cast operation ${test.method}`);
              }
              if (test.debug) {
                this.logger.debug(`Cast result: ${JSON.stringify(result)}`);
              }

              const elapsed = Date.now() - start;

              this.logger.log(`Cast '${test.name}', completed in ${elapsed} ms`);

              results.push({
                name: test.name,
                type: test.type,
                method: test.method,
                success: true
              });
            }
          } catch (error) {
            this.logger.warn(`Call '${test.method}', failed: ${JSON.stringify(error)}`);
            score -= test.score;

            results.push({
              name: test.name,
              type: test.type,
              method: test.method,
              success: false
            });
          }
        }

        const nodeScore = Math.round(score * 100 / maxScore)
        store.push({ name: node.name, endpoint: node.endpoint, score: nodeScore, tests: results });
        this.logger.log(`Node scan completed for ${node.name}, score: ${nodeScore}`);
      }

      this.store = store;

      this.logger.log('Node scan completed successfully')
      return true;
    } catch (error) {
      this.logger.error(`Unexpected error during node scanning: ${JSON.stringify(error)}`)
      return false;
    }
  }

}
