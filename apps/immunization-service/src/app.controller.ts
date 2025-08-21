import { Controller, Get } from '@nestjs/common';
import { ImmunizationServiceService } from './app.service';

@Controller()
export class ImmunizationServiceController {
  constructor(private readonly immunizationServiceService: ImmunizationServiceService) {}

  @Get()
  getHello(): string {
    return this.immunizationServiceService.getHello();
  }
}
