# Build My Own Git

Build my own git for learning.

## Development Status

<img src="https://img.shields.io/badge/status-wip-019733.svg?style=flat" />

### Available Command

⚠️ All commands are invoked by `pnpm start <command>`.

- [x] init
- [ ] commit

## Development

### Setup

1. `corepack enable`
2. `pnpm i`

### Utils

#### inflate

```
alias inflate='node -e "process.stdin.pipe(require(\"zlib\").createInflate()).pipe(process.stdout)"'
```

## License

[MIT](./LICENSE.md) License © [ikuma-t](https://github.com/IkumaTadokoro)
