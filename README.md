# Project Manager

CLI to help manage local project folders hosted on GitHub. Core function is to re-initialize projects and link them to GitHub repositories, after automatic cleaning of node_modules and .git folders.

## Features

- Initialize projects and link them to GitHub repositories
- Clean projects by deleting `node_modules` and `.git` folders
- Refresh and manage the list of GitHub repositories
- Set up projects by cloning repositories and installing dependencies
- Check if a project needs setup when the tool is run

## Installation

To install run:

```sh
# pnpm i -g pfm
pnpm i
pnpm link --global # > 'pfm' linked

# if you want to use in another project
pnpm link pfm
```

## Usage

To use Project Folder Manager, navigate to your project directory in the terminal and run:

```sh
# after local link
pfm    # (auto mode)
pfm -c # ('custom' interactive mode)
```

You will be presented with a menu of actions to choose from:

1. Initialize project
2. Clean project
3. Refresh repositories
4. Set up project
5. Exit

Follow the prompts to perform the desired action.

## Development
```
git clone <repo-url> .
pnpm i
pnpm run dev
```

## Build
```sh
pnpm run build
```

## Configuration

Make sure to set the `GITHUB_TOKEN` environment variable with your GitHub personal access token to enable GitHub API integration.

```sh
# 1. copy env file
cp .env.example .env

# 2. set your github token from:
# https://github.com/settings/tokens
```

## TODO: 
- Goals defined: [`docs/docs.md`](./docs/docs.md)
