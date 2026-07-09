# CLAUDE.md

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Type-check/build: `npm run build`
- Lint/type-check: `npm run lint`

## Workflow rules

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, deleting branches, or force pushing without confirmation.
- Keep diffs focused on the requested task.
- Add or update tests for behavior changes.
- Before finishing, report the exact commands run and their results.

## Architecture rules

- Controllers should handle HTTP concerns only.
- Services contain business rules.
- Repositories hold in-memory persistence logic for this greenfield project.
- Money is represented in cents as integers.
- Avoid adding dependencies unless the existing code cannot reasonably solve the problem.
- Prefer existing patterns before introducing new abstractions.
