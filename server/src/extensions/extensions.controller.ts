import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ExtensionsService } from './extensions.service';

@Controller('practices/:practiceId/clients/:clientId/extensions')
export class ExtensionsController {
	constructor(private readonly extensionsService: ExtensionsService) {}

	@Get()
	async getExtensions(
		@Param('practiceId') practiceId: string,
		@Param('clientId') clientId: string,
		@Query('slot') slot: string,
		@Headers('x-user') userHeader?: string,
	) {
		if (!slot) return [];
		const username = (userHeader || '').toString() || undefined;
		return this.extensionsService.resolveExtensions(practiceId, clientId, slot, username);
	}
}
