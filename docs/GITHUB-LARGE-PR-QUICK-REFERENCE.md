# Quick Reference: GitHub Large PR Optimization

## The Message

> "This page has been optimized for large pull requests. Some browser features (like Find on Page or Select All) may not work as expected."

## What It Means

🚀 **GitHub is protecting your browser** from performance issues caused by rendering thousands of code changes at once.

## Why You See It

Your PR contains:
- 100+ changed files, OR
- 10,000+ lines changed, OR
- Very large diff size (1+ MB)

## What Doesn't Work

| Feature | Impact | Workaround |
|---------|--------|------------|
| **Ctrl+F / Cmd+F** | Only searches visible sections | Use GitHub file finder (press `t`) |
| **Ctrl+A / Cmd+A** | Only selects visible content | Download raw files or checkout locally |
| **Browser highlighting** | Limited to visible sections | Navigate files individually |
| **Copy/paste** | May need per-file copy | Use "View file" button |

## Quick Fixes

### 🔍 To Search the PR
```bash
# Option 1: GitHub CLI
gh pr checkout <number>
# Then search in your IDE

# Option 2: Local checkout
git fetch origin pull/<number>/head:pr-<number>
git checkout pr-<number>
```

### 📋 To Copy All Changes
```bash
# Download the diff
curl -L "https://github.com/owner/repo/pull/<number>.diff" > pr.diff

# Or download the patch
curl -L "https://github.com/owner/repo/pull/<number>.patch" > pr.patch
```

### 👀 To Review Large PRs
1. **Review file-by-file** instead of all at once
2. **Use filters** to show only specific file types
3. **Hide whitespace changes** to reduce noise
4. **Checkout locally** for full IDE features

## Best Practices

### ✅ DO
- Split large changes into smaller PRs
- Review in your local IDE for big diffs
- Use GitHub CLI (`gh`) for easier navigation
- Filter files by type or folder

### ❌ AVOID
- Creating PRs with 100+ files when possible
- Including generated code in reviews
- Expecting browser Find to work across entire PR
- Trying to select/copy everything at once

## Need More Help?

See the full guide: [GITHUB-LARGE-PR-OPTIMIZATION.md](./GITHUB-LARGE-PR-OPTIMIZATION.md)

---

**TL;DR**: GitHub optimizes large PRs for performance. Some browser shortcuts won't work across the entire PR. Checkout locally for full search/navigation features.
