import { Controller, Get } from '@nestjs/common';
import { ScannerService, NodeStatus } from './scanner/scanner.service';

@Controller()
export class AppController {

  constructor(private readonly scannerService: ScannerService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

}
