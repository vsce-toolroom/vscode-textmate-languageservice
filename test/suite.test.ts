'use strict';

import * as vscode from 'vscode';
vscode.window.showInformationMessage('Start all tests.');

import('./suite/selectors.util.test');
import('./suite/tokenizer.service.test');
import('./suite/outline.service.test');
import('./suite/document.service.test');
import('./suite/folding.test');
import('./suite/definition.test');
import('./suite/document-symbol.test');
import('./suite/workspace-symbol.test');
