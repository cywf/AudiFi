# AudiFi Security Checks

## Overview

This document describes the security scanning and compliance checks integrated into the AudiFi CI/CD pipeline, aligned with the SECURITY-AGENT's guidance.

## Security Workflow Location

```
.github/workflows/security.yml
```

## Scan Types

### 1. Dependency Vulnerability Scanning

**Tool:** `npm audit`

**Trigger:** PRs, pushes to main/develop, nightly schedule

**What it checks:**
- Known vulnerabilities in npm dependencies
- Transitive dependency issues
- Security advisories from npm registry

**Severity Levels:**

| Level | Action |
|-------|--------|
| Critical | ❌ Blocks PR merge |
| High | ❌ Blocks PR merge |
| Moderate | ⚠️ Warning (allowed) |
| Low | ✅ Allowed |

**Fixing Vulnerabilities:**

```bash
# View vulnerabilities
npm audit

# Attempt automatic fix
npm audit fix

# Force fix (may break changes)
npm audit fix --force

# Update specific package
npm update <package-name>
```

### 2. Static Analysis (ESLint)

**Tool:** ESLint with security-focused rules

**Trigger:** All PRs and pushes

**What it checks:**
- Code quality issues
- Potential security anti-patterns
- React-specific security issues
- TypeScript type safety

**Configuration:**

The ESLint configuration is defined in `eslint.config.js`:

```javascript
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Additional security rules can be added here
    },
  }
);
```

### 3. CodeQL Analysis

**Tool:** GitHub CodeQL

**Trigger:** PRs, pushes, nightly schedule

**What it checks:**
- SQL injection patterns
- Cross-site scripting (XSS)
- Path traversal
- Code injection
- Security misconfigurations

**Queries:** Security-extended query suite

**Results:** Available in GitHub Security tab

### 4. Secret Scanning

**Tool:** Custom patterns + GitHub Secret Scanning

**Trigger:** All PRs and pushes

**What it checks:**
- Hardcoded API keys
- AWS credentials
- Private keys
- Passwords in source code
- Database connection strings

**Patterns Detected:**

| Pattern | Example |
|---------|---------|
| AWS Access Key | `AKIA1234567890ABCDEF` |
| Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| Hardcoded Password | `password: "secret123"` |

### 5. License Compliance

**Tool:** `license-checker`

**Trigger:** All PRs and pushes

**What it checks:**
- Dependency license compatibility
- Copyleft license detection
- License attribution requirements

**Allowed Licenses:**
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC

**Requires Review:**
- GPL variants
- LGPL variants
- MPL-2.0

## Scheduled Scans

### Nightly Security Scan

**Schedule:** 2:00 AM UTC daily

**Purpose:**
- Catch newly disclosed vulnerabilities
- Detect dependencies that became vulnerable since last PR
- Continuous compliance monitoring

**Notification:**
- Failed scans create workflow run failures
- Configure GitHub notification settings for alerts

## Interpreting Results

### Dependency Audit Results

```json
{
  "metadata": {
    "vulnerabilities": {
      "critical": 0,
      "high": 1,
      "moderate": 3,
      "low": 2
    }
  }
}
```

**Actions:**
1. Review each vulnerability in `npm audit` output
2. Check if vulnerability is exploitable in your context
3. Update affected package if fix is available
4. Add to `.npmrc` override if false positive

### ESLint Results

```json
[
  {
    "filePath": "/src/App.tsx",
    "errorCount": 0,
    "warningCount": 2,
    "messages": [
      {
        "ruleId": "@typescript-eslint/no-unused-vars",
        "severity": 1,
        "message": "'x' is defined but never used"
      }
    ]
  }
]
```

**Actions:**
1. Fix all errors (warnings are acceptable)
2. Use `// eslint-disable-next-line` for intentional exceptions
3. Document any disabled rules

### CodeQL Alerts

CodeQL results appear in the GitHub Security tab:

1. Navigate to **Security** → **Code scanning alerts**
2. Review each alert
3. Mark as "False positive" or "Fixed"
4. Create issues for legitimate findings

## Security Best Practices

### Code Guidelines

```typescript
// ❌ Bad: Hardcoded credentials
const apiKey = "sk_live_abc123";

// ✅ Good: Environment variable
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ Bad: Direct HTML injection
element.innerHTML = userInput;

// ✅ Good: Safe text content
element.textContent = userInput;

// ❌ Bad: eval() usage
eval(userCode);

// ✅ Good: Structured data handling
JSON.parse(userJson);
```

### Dependency Guidelines

1. **Pin versions** in production dependencies
2. **Use lockfiles** (`package-lock.json`)
3. **Review changelog** before major updates
4. **Check package health** (downloads, maintenance)

### Secret Management

1. **Never commit secrets** to source control
2. **Use GitHub Secrets** for CI/CD credentials
3. **Rotate secrets** regularly
4. **Use environment-specific** secrets

## Adjusting Thresholds

### Modify Audit Severity

In `.github/workflows/security.yml`:

```yaml
- name: Run npm audit
  run: npm audit --audit-level=high  # Options: low, moderate, high, critical
```

### Ignore Specific Vulnerabilities

Create `.nsprc` file:

```json
{
  "advisories": {
    "1234": "False positive - not exploitable in our context"
  }
}
```

### Custom ESLint Rules

Update `eslint.config.js`:

```javascript
rules: {
  // Add security rules
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
}
```

## Integration with SECURITY-AGENT

### Current Hooks

| Check | CI Integration | Status |
|-------|----------------|--------|
| Dependency scanning | ✅ `npm audit` | Active |
| Static analysis | ✅ ESLint | Active |
| CodeQL SAST | ✅ GitHub CodeQL | Active |
| Secret detection | ✅ Pattern matching | Active |
| License check | ✅ `license-checker` | Active |

### Future Hooks

| Check | Integration Point | Status |
|-------|-------------------|--------|
| DAST (Dynamic Analysis) | Staging deployment | 🔜 Planned |
| Container scanning | Backend pipeline | 🔜 Planned |
| Smart contract audit | Contract deploy | 🔜 Planned |
| Penetration testing | Release pipeline | 🔜 Planned |

## Failure Impact

### On Pull Requests

| Check | Failure Impact |
|-------|----------------|
| Critical/High vulnerabilities | ❌ Blocks merge |
| ESLint errors | ❌ Blocks merge |
| CodeQL critical | ❌ Blocks merge (if configured) |
| Secrets detected | ❌ Blocks merge |

### On Main/Develop Push

- Deployment continues (already merged)
- Alert generated for team review
- Nightly scan will re-check

## Reporting

### Artifacts

Security scan results are available as artifacts:

| Artifact | Contents | Retention |
|----------|----------|-----------|
| `npm-audit-results` | Full audit JSON | 30 days |
| `eslint-results` | ESLint JSON output | 30 days |

### Job Summary

Each workflow run includes a summary in the Actions tab:

```markdown
## 🛡️ Security Scan Summary

| Check | Status |
|-------|--------|
| Dependency Vulnerabilities | ✅ Passed |
| Static Analysis | ✅ Passed |
| Secret Scanning | ✅ Passed |

---
*Scan completed at 2025-11-29 02:00:00 UTC*
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| False positive in npm audit | Add to `.nsprc` ignore list |
| ESLint rule too strict | Adjust in `eslint.config.js` |
| CodeQL timeout | Reduce query complexity |
| Secret pattern false positive | Adjust regex pattern |

### Getting Help

1. Check workflow logs in GitHub Actions
2. Review artifact files for detailed output
3. Consult GitHub Security documentation
4. Contact SECURITY-AGENT for guidance

---

*This document is part of the AudiFi CI/CD documentation.*
