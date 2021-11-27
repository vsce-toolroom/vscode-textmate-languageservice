import vscode from 'vscode';

export default function(key: string | number, value: unknown) {
    if (key === "uri" && value instanceof vscode.Uri) {
        return value.path;
    }
    return value;
}
