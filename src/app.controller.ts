import { Controller, Get } from '@nestjs/common';
import { ScannerService, NodeStatus } from './scanner/scanner.service';

@Controller()
export class AppController {

  constructor(private readonly scannerService: ScannerService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

  @Get('nodes')
  getNodes(): NodeStatus[] {
    return this.scannerService.getNodes();
  }

  @Get('best')
  getBest(): NodeStatus[] {
    return this.scannerService.getNodes()
      .filter(n => n.score > 75)
      .sort((a, b) => b.score - a.score);
  }

}
