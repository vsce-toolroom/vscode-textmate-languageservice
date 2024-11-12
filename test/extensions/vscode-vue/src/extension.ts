import * as vscode from 'vscode';
import TextmateLanguageService from 'vscode-textmate-languageservice';

export async function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentSelector = 'vue';
    const textmateService = new TextmateLanguageService(selector, context);
}

export function deactivate() {}
