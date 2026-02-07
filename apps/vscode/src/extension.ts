/**
 * NSTG VS Code Extension - Negative Space Test Generator for VS Code
 *
 * This extension integrates NSTG test generation capabilities into VS Code.
 */

import * as vscode from 'vscode';

/**
 * Activate the NSTG extension
 */
export function activate(context: vscode.ExtensionContext): void {
  // Register commands and providers here
  console.log('NSTG VS Code extension activated');

  // Example command registration:
  const disposable = vscode.commands.registerCommand('nstg.generateTests', () => {
    vscode.window.showInformationMessage('NSTG: Generate Tests');
  });

  context.subscriptions.push(disposable);
}

/**
 * Deactivate the NSTG extension
 */
export function deactivate(): void {
  console.log('NSTG VS Code extension deactivated');
}
