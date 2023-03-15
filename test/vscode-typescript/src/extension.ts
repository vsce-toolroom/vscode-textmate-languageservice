import * as vscode from 'vscode';
import TextmateLanguageService from 'vscode-textmate-languageservice';

export async function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentSelector = 'custom';
    const textmateService = new TextmateLanguageService(selector, context);
    await textmateService.initTokenService();
}

export function deactivate() {}
