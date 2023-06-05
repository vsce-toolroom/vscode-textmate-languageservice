# Contributing

<div align="center"><img src="./assets/icon.png" width="150px"></img></div>

This theme follows a bimonthly-to-monthly release schedule. Releases occur on the first day of every month and/or two weeks prior to 12:00AM UTC. This ensures that users will not be spammed with updates from NPM and Dependabot.

Here are a few ways you can contribute to this repository:

- Create issues
  - Request features
  - Report bugs
- Open pull requests

## Create issues

### Request features

If you are requesting features, please check if a similar issue exists. If the feature request does not exist, please make a feature request & include the following information:

- Precise description of feature.
- Is the feature probably a major or minor change?
  - Major = new dependencies, features or full rework.
  - Minor = developer changes or minor implementation-related work.
- Is this item on the [roadmap] or not?

Please limit your requests to one feature per issue.

### Report bugs

If you are reporting bugs, please include the following information in your report:

- Broswer version
- OS version
- Dependent extension ID
- Does this issue occur when other extensions are disabled?
- Steps to reproduce
- Code sample or screenshot (MVCE)
- Bug description (expected vs actual behaviour)

Please limit your description and code sample/screenshot(s) to one MVCE (Minimum Complete Verifiable Example).

## Open pull requests

1. Fork the project

2. Clone your fork

3. Create a **`feature`** branch

   ```sh
   git checkout -b cool-feature
   ```

4. Commit your changes

   You **must** [link your commit to an issue][github-pr-link] to have your commit accepted:
   ```sh
   git commit -m "Added cool feature (#1337)"
   ```

5. Run tests targeting the [latest version of all Visual Studio Code distribution channels][vscode-download].
   ```sh
   npm test
   ```
   Installation links:
   - Latest version of [VS Code][vscode-download].
   - Latest version of [VS Code Insiders][vscode-insiders-download].
   - Latest version of [VSCodium][vscodium-download].


<!-- Create issues -->
[roadmap]: https://github.com/vsce-toolroom/vscode-textmate-languageservice/-/blob/main/CHANGELOG.md#roadmap
<!-- Open pull requests -->
[github-pr-link]: https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
[vscode-download]: https://code.visualstudio.com/Download
[vscode-insiders-download]: https://code.visualstudio.com/insiders/
[vscodium-download]: https://vscodium.com/#install
