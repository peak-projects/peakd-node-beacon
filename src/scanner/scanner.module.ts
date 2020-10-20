import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuotesModule } from '../quotes/quotes.module';
import { ScannerService } from './scanner.service';

@Module({
  imports: [QuotesModule],
  providers: [ScannerService, ConfigService],
  exports: [ScannerService]
})
export class ScannerModule {}
