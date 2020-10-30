import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ScannerService, NodeStatus } from './scanner/scanner.service';

export type NodeScore = {
  name: string;
  endpoint: string;
  score: number;
  success: number;
  fail: number;
};

const fromNodeStatus = (node: NodeStatus): NodeScore => ({
  name: node.name,
  endpoint: node.endpoint,
  score: node.score,
  success: node.tests.filter(t => t.success).length,
  fail: node.tests.filter(t => !t.success).length
})

@Controller()
export class AppController {

  constructor(private readonly scannerService: ScannerService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

  @Get('best')
  getBest(): NodeScore[] {
    return this.scannerService.getNodes()
      .filter(n => n.score > 75)
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
