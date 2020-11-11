import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as hive from '@hiveio/hive-js';
import { ChainTypes, makeBitMaskFilter } from '@hiveio/hive-js/lib/auth/serializer';
import { QuotesService } from '../quotes/quotes.service';

const allNodes = [
  { name: 'api.hive.blog', endpoint: 'https://api.hive.blog' },
  { name: 'anyx.io', endpoint: 'https://anyx.io' },
  { name: 'api.hivekings.com', endpoint: 'https://api.hivekings.com' },
  { name: 'api.deathwing.me', endpoint: 'https://api.deathwing.me' },
  { name: 'api.openhive.network', endpoint: 'https://api.openhive.network' },
  { name: 'hive.roelandp.nl', endpoint: 'https://hive.roelandp.nl' },
  { name: 'rpc.ausbit.dev', endpoint: 'https://rpc.ausbit.dev' },
  { name: 'api.pharesim.me', endpoint: 'https://api.pharesim.me' },
  { name: 'hive-api.arcange.eu', endpoint: 'https://hive-api.arcange.eu' },
  { name: 'hived.emre.sh', endpoint: 'https://hived.emre.sh' },
  { name: 'hived.privex.io', endpoint: 'https://hived.privex.io' },
  { name: 'fin.hive.3speak.co', endpoint: 'https://fin.hive.3speak.co' },
  { name: 'rpc.ecency.com', endpoint: 'https://rpc.ecency.com', website_only: true }
];

export type NodeTest = {
  name: string;
  description: string;
  type: string;
  method: string;
  params: any;
  score: number;
  debug: boolean;
  validator: (result: any) => boolean;
};

export type NodeTestResult = {
  name: string;
  description: string;
  type: string;
  method: string;
  success: boolean;
};

export type NodeStatus = {
  name: string;
  endpoint: string;
  updated_at: string;
  score: number;
  website_only: boolean;
  tests: NodeTestResult[];
};

@Injectable()
export class ScannerService implements OnModuleInit {

  private readonly logger = new Logger(ScannerService.name);

  private isRunning: boolean = false;

  private tests: NodeTest[] = [];

  private store: NodeStatus[] = [];

  constructor(private configService: ConfigService, private quotesService: QuotesService) {
    const beaconAccount = this.configService.get<string>('BEACON_ACCOUNT');

    const apiChainId = this.configService.get<string>('API_CHAIN_ID') || 'beeab0de00000000000000000000000000000000000000000000000000000000';
    const apiParamAccount = this.configService.get<string>('API_PARAM_ACCOUNT') || 'peakd';
    const apiParamCommunity = this.configService.get<string>('API_PARAM_COMMUNITY') || 'hive-156509';

    this.tests = [
      {
        name: 'get_version',
        description: 'Get the current version of the node',
        type: 'fetch',
        method: 'database_api.get_version',
        params: {},
        score: 50,
        debug: false,
        validator: (result) => {
          return result.chain_id === apiChainId
        }
      },
      {
        name: 'dynamic_global_properties',
        description: 'Check chain global properties',
        type: 'fetch',
        method: 'database_api.get_dynamic_global_properties',
        params: {},
        score: 25,
        debug: false,
        validator: (result) => {
          return 'head_block_number' in result && 'hbd_interest_rate' in result
        }
      },
      {
        name: 'feed_history',
        description: 'Get price feed history',
        type: 'fetch',
        method: 'database_api.get_feed_history',
        params: {},
        score: 15,
        debug: false,
        validator: () => true
      },
      {
        name: 'get_accounts',
        description: 'Retrieve an account details',
        type: 'fetch',
        method: 'call',
        params: ['database_api', 'get_accounts', [[apiParamAccount]]],
        score: 25,
        debug: false,
        validator: (result) => {
          return Array.isArray(result) && result.length === 1
        }
      },
      {
        name: 'get_followers',
        description: 'Retrieve a follower for an account',
        type: 'fetch',
        method: 'call',
        params: ['follow_api', 'get_followers', [apiParamAccount, beaconAccount, 'blog', 1]],
        score: 15,
        debug: false,
        validator: (result) => {
          return Array.isArray(result) && result.length === 1 && result[0].follower && result[0].follower === apiParamAccount
        }
      },
      {
        name: 'get_post',
        description: 'Retrieve a single post and associated details',
        type: 'fetch',
        method: 'bridge.get_post',
        params: { author: 'hiveio', permlink: 'hive-first-community-hardfork-complete', observer: 'hiveio' },
        score: 15,
        debug: false,
        validator: (result) => {
          return result && result.post_id && result.children > 1
        }
      },
      {
        name: 'get_ranked_by_created',
        description: 'Fetch recently created posts',
        type: 'fetch',
        method: 'bridge.get_ranked_posts',
        params: { tag: '', sort: 'created', limit: 20, observer: apiParamAccount },
        score: 25,
        debug: false,
        validator: (result) => {
          const minTimestamp = new Date().getTime() - (1000 * 60 * 5);
          const minDate = new Date();
          minDate.setTime(minTimestamp);
          const fiveMinuteAgoString = (minDate.toISOString()).split('.')[0]

          return Array.isArray(result) && result.length === 20 && result[0].created > fiveMinuteAgoString
        }
      },
      {
        name: 'get_ranked_by_trending',
        description: 'Fetch posts sorted by "trending"',
        type: 'fetch',
        method: 'bridge.get_ranked_posts',
        params: { tag: '', sort: 'trending', limit: 20, observer: apiParamAccount },
        score: 15,
        debug: false,
        validator: () => true
      },
      {
        name: 'get_account_posts_by_blog',
        description: 'Get posts in an user blog',
        type: 'fetch',
        method: 'bridge.get_account_posts',
        params: { account: apiParamAccount, sort: 'blog', limit: 20, observer: apiParamAccount },
        score: 15,
        debug: false,
        validator: () => true
      },
      {
        name: 'get_account_posts_by_feed',
        description: 'Get posts for an user "following" feed in correct order',
        type: 'fetch',
        method: 'bridge.get_account_posts',
        params: { account: apiParamAccount, sort: 'feed', limit: 20, observer: apiParamAccount },
        score: 15,
        debug: false,
        validator: (result) => {
          if (!Array.isArray(result) || result.length !== 20) {
            return false
          }

          // check that posts are sorted by created desc
          const isSorted = [...result] // clone array
            .sort((a, b) => b.created.localeCompare(a.created)) // sort it
            .every((el, i) => el.author === result[i].author && el.permlink === result[i].permlink) // compare with original value

          return isSorted
        }
      },
      {
        name: 'get_account_posts_by_replies',
        description: 'Get replies to an user posts/comments',
        type: 'fetch',
        method: 'bridge.get_account_posts',
        params: { account: apiParamAccount, sort: 'replies', limit: 20, observer: apiParamAccount },
        score: 15,
        debug: false,
        validator: () => true
      },
      {
        name: 'get_community_pinned_and_muted',
        description: 'Get posts feed for a community and check for pinned/muted posts',
        type: 'fetch',
        method: 'bridge.get_ranked_posts',
        params: { tag: apiParamCommunity, sort: 'created', limit: 20, observer: apiParamAccount },
        score: 15,
        debug: false,
        validator: (result) => {
          if (!Array.isArray(result) || result.length !== 20) {
            return false
          }

          if (result[0].category !== apiParamCommunity) {
            return false
          }

          if (!result[0].stats || !result[0].stats.is_pinned) {
            return false
          }

          return true
        }
      },
      {
        name: 'get_account_history',
        description: 'Load transaction history for an account (both activities and wallet transactions)',
        type: 'fetch',
        method: 'call',
        params: ['database_api', 'get_account_history', [beaconAccount, -1, 250, ...makeBitMaskFilter([ChainTypes.operations.transfer])]],
        score: 15,
        debug: false,
        validator: (result) => Array.isArray(result) && result.length > 50
      },
      {
        name: 'custom_json',
        description: 'Try to cast a "custom_json" operation',
        type: 'cast',
        method: 'custom_json',
        params: { id: 'beacon_custom_json', json: JSON.stringify({ ping: 'pong' }), required_auths: [], required_posting_auths: [beaconAccount] },
        score: 10,
        debug: false,
        validator: () => true
      },
      {
        name: 'transfer',
        description: 'Try to cast a "transfer" operation (validated as part of the chain consensus)',
        type: 'cast',
        method: 'transfer',
        params: { from: beaconAccount, to: beaconAccount, amount: '0.001 HIVE', memo: '$' },
        score: 15,
        debug: false,
        validator: () => true
      },
    ];
  }

  onModuleInit() {
    this.scan();
  }

  getNodes(): NodeStatus[] {
    return this.store;
  }

  @Cron('0 */10 * * * *')
  async scan(): Promise<boolean> {
    // skip if already running
    if (this.isRunning) {
      this.logger.warn('Scanner already running -> skip');
      return;
    }

    this.isRunning = true;

    try {
      const store: NodeStatus[] = [];
      const maxScore: number = this.tests.reduce((acc, cur) => { return acc + cur.score }, 0);


      this.logger.log('Starting node scanner ...');

      const excludedNodes = this.configService.get<string>('EXCLUDED_NODES')
        ? this.configService.get<string>('EXCLUDED_NODES').split(',')
        : [];

      const nodes = allNodes.filter(n => !excludedNodes.includes(n.name))

      this.logger.log('Configured nodes: ' + nodes.map(n => n.name));

      for (const node of nodes) {
        this.logger.log(`Switching node to: ${node.name}`);
        hive.api.setOptions({ url: node.endpoint })

        let score: number = maxScore;
        let results: NodeTestResult[] = [];
        for (const test of this.tests) {
          try {
            if (test.type === 'fetch') {
              this.logger.log(`Call '${test.name}', params: ${JSON.stringify(test.params)}: ...`);

              const start = Date.now();
              const result = await hive.api.callAsync(test.method, test.params);
              if (test.debug) {
                this.logger.debug(`Call result: ${JSON.stringify(result)}`);
              }

              const success = test.validator ? test.validator(result) : true
              const elapsed = Date.now() - start;

              if (success) {
                this.logger.log(`Call '${test.name}', completed in ${elapsed} ms`);
                results.push({
                  name: test.name,
                  description: test.description,
                  type: test.type,
                  method: test.method,
                  success: true
                });
              } else {
                this.logger.warn(`Call '${test.name}', failed in ${elapsed} ms`);
                score -= test.score;
                results.push({
                  name: test.name,
                  description: test.description,
                  type: test.type,
                  method: test.method,
                  success: false
                });
              }
            }
            else if (test.type === 'cast') {
              const start = Date.now();
              let result = null;
              if (test.method === 'custom_json') {
                const postingKey = this.configService.get<string>('BEACON_ACCOUNT_POSTING_KEY');
                if (postingKey) {
                  this.logger.log(`Cast '${test.name}', params: ${JSON.stringify(test.params)}: ...`);
                  result = await hive.broadcast.sendAsync({ operations: [[test.method, test.params]], extensions: [] }, { posting: postingKey.trim() })
                } else {
                  this.logger.log(`Skip ${test.name} -> no posting key`);
                }
              }
              else if (test.method === 'transfer') {
                const activeKey = this.configService.get<string>('BEACON_ACCOUNT_ACTIVE_KEY');
                if (activeKey) {
                  const params = { ...test.params, memo: this.quotesService.getRandomQuote() };

                  this.logger.log(`Cast '${test.name}', params: ${JSON.stringify(params)}: ...`);
                  result = await hive.broadcast.sendAsync({ operations: [[test.method, params]], extensions: [] }, { active: activeKey.trim() })
                } else {
                  this.logger.log(`Skip ${test.name} -> no active key`);
                }
              }
              else {
                throw new Error(`Unsupported cast operation ${test.method}`);
              }

              if (test.debug) {
                this.logger.debug(`Cast result: ${JSON.stringify(result)}`);
              }

              const elapsed = Date.now() - start;

              this.logger.log(`Cast '${test.name}', completed in ${elapsed} ms`);

              results.push({
                name: test.name,
                description: test.description,
                type: test.type,
                method: test.method,
                success: true
              });
            }
          } catch (error) {
            this.logger.warn(`Call '${test.method}', failed: ${error.toString()}`);
            score -= test.score;

            results.push({
              name: test.name,
              description: test.description,
              type: test.type,
              method: test.method,
              success: false
            });
          }
        }

        const nodeScore = Math.round(score * 100 / maxScore)
        store.push({
          name: node.name,
          endpoint: node.endpoint,
          updated_at: new Date().toISOString(),
          score: nodeScore,
          website_only: node.website_only || false,
          tests: results,
        });
        this.logger.log(`Node scan completed for ${node.name}, score: ${nodeScore}`);
      }

      this.store = store;

      this.logger.log('Node scan completed successfully')
      return true;
    } catch (error) {
      this.logger.error(`Unexpected error during node scanning: ${error.toString()}`)
      return false;
    } finally {
      this.isRunning = false;
    }
  }

}
