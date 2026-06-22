# Publishing @veil_/agent-registry to npm

## Pre-publish checklist

```bash
pnpm --filter @veil_/agent-registry typecheck
pnpm --filter @veil_/agent-registry test
pnpm --filter @veil_/agent-registry build
```

## Publish

From the repo root, with an npm account that has access to the `@veil_` org:

```bash
pnpm --filter @veil_/agent-registry publish --access public --tag latest
```

## Pre-release tags

For a release candidate before a marketplace submission is approved:

```bash
pnpm --filter @veil_/agent-registry publish --access public --tag next
```

Install the pre-release with:

```bash
npm install @veil_/agent-registry@next
```

## Verifying the MCP bin

After publishing, confirm the `veil-mcp` bin resolves correctly:

```bash
npx @veil_/agent-registry
```

This should start the MCP server on stdio with no errors.

## Links

- https://veilprotocol.net
- https://veilprotocol.net/docs
