'use strict';

import TextmateLanguageService from '../main';
import { ServiceBase } from '../util/service';

export class GeneratorService extends ServiceBase<TextmateLanguageService> {
	constructor(
	) {
		super();
	}

	public parse(languageId: string): Promise<TextmateLanguageService> {
		return Promise.resolve(new TextmateLanguageService(languageId));
	}
}
