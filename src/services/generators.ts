import TextmateLanguageService from '../main';
import { ServiceBase } from '../util/service';

export class GeneratorService extends ServiceBase<TextmateLanguageService> {
	constructor(
	) {
		super();
	}

	public async parse(languageId: string): Promise<TextmateLanguageService> {
		return new TextmateLanguageService(languageId);
	}
}
