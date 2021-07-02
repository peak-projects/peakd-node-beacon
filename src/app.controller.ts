import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ScannerService, NodeStatus } from './scanner/scanner.service';

export type NodeScore = {
  name: string;
  endpoint: string;
  score: number;
  updated_at: string;
  success: number;
  fail: number;
};

const fromNodeStatus = (node: NodeStatus): NodeScore => ({
  name: node.name,
  endpoint: node.endpoint,
  score: node.score,
  updated_at: node.updated_at,
  success: node.tests.filter(t => t.success).length,
  fail: node.tests.filter(t => !t.success).length,
});

const BEST_NODES_SCORE_THRESHOLD = 100;
const VALID_NODES_SCORE_THRESHOLD = 75;
const MIN_NODES = 5;
@Controller()
export class AppController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

  @Get('best')
  getBest(): NodeScore[] {
    const nodes = this.scannerService
      .getNodes()
      .filter(n => n.score > 0 && !n.website_only);

    const bestNodes: NodeStatus[] = nodes.filter(
      n => n.score >= BEST_NODES_SCORE_THRESHOLD,
    );

    // if there are at least MIN_NODES with the best score -> return
    if (bestNodes.length >= MIN_NODES) {
      return bestNodes
        .map(n => fromNodeStatus(n))
        .sort((a, b) => b.score - a.score);
    }

    // otherwise reduce the filter threshold
    return nodes
      .filter(n => n.score >= VALID_NODES_SCORE_THRESHOLD)
      .map(n => fromNodeStatus(n))
      .sort((a, b) => b.score - a.score);
  }

  @Get('nodes')
  getNodes(): NodeScore[] {
    return this.scannerService.getNodes().map(n => fromNodeStatus(n));
  }

  @Get('nodes/:name')
  getNode(@Param('name') name: string): NodeStatus {
    const node = this.scannerService.getNodes().find(n => n.name === name);
    if (!node) {
      throw new HttpException('API node not found', HttpStatus.BAD_REQUEST);
    }

    return node;
  }
}
