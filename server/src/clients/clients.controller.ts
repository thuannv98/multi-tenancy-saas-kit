import { Controller, Get, Post, Param, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('practices/:practiceId/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async list(@Param('practiceId') practiceId: string) {
    return this.clientsService.listForPractice(practiceId);
  }

  @Post()
  async create(
    @Param('practiceId') practiceId: string,
    @Body() body: { name: string; secret?: string },
    @Headers('x-user') userHeader?: string,
  ) {
    const username = (userHeader || '').toString();
    if (!body || !body.name) throw new HttpException('Missing name', HttpStatus.BAD_REQUEST);
    try {
      const client = await this.clientsService.create(practiceId, body.name, body.secret || 'secret', username);
      return client;
    } catch (err: any) {
      if (err.message === 'forbidden') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException('Creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
