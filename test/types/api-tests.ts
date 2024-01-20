import * as vscode from 'vscode';
import TextmateLanguageService from '../..';

const { getTokenInformationAtPosition } = TextmateLanguageService.api;

const editor = vscode.window.activeTextEditor;
const document = editor.document;
const position = editor.selection.active;

// $ExpectType TokenInformation
const token = await getTokenInformationAtPosition(document, position);

// $ExpectType StandardTokenType
const tokenType = token.type;

// $ExpectType string
const tokenTypeKey = vscode.StandardTokenType[tokenType];

void vscode.window.showInformationMessage(`Inspected token type: ${tokenTypeKey}`);
