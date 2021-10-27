# Changelog

## 0.1.1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Compatibility&message=>=v1.51.0&logo=visualstudio&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/tree/v0.1.1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-10-28&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/projects/2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Project%20Board&message=v0.1.1&logo=trello&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/milestone/2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v0.1.1&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

Adds engine tokenization queue to improve performance for large files.

## 0.1.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Compatibility&message=>=v1.51.0&logo=visualstudio&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/tree/v0.1.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-08-27&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/projects/1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Project%20Board&message=v0.1.0&logo=trello&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/SNDST00M/vscode-textmate-languageservice/milestone/1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v0.1.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

Initial version:

- Core Textmate engine generating data collection from Textmate token list.
- Includes five providers:
  - Document symbol provider
  - Folding provider
  - Peek definition provider
  - Table of Contents provider
  - Workspace symbol provider
- Configurable by `textmate-configuration.json`.
- Providers are exposed by a module index at [`./src/index.ts`][github-vsctmls-index].

## Roadmap

- Semantic highlighting provider for parameters.
- Semantic highlighting for variable assignment driven by token types and/or text.
- Custom entry text/type getter for "Table of Contents" provider.

<!-- 0.1.0 -->
[github-vsctmls-index]: https://github.com/SNDST00M/vscode-textmate-languageservice/blob/v0.1.0/src/index.ts
