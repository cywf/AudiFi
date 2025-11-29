# AudiFi Security Policy

Thank you for helping keep AudiFi and our users safe!

## Reporting Security Issues

If you believe you have found a security vulnerability in AudiFi, please report it to us through coordinated disclosure.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report vulnerabilities using one of the following methods:

1. **Email**: Send a detailed report to security@audifi.io (TBD)
2. **GitHub Security Advisories**: Use the [private vulnerability reporting](https://github.com/cywf/AudiFi/security/advisories/new) feature

### What to Include

Please include as much of the following information as possible:

- **Type of issue**: (e.g., smart contract vulnerability, authentication bypass, XSS, SQL injection)
- **Affected components**: Which parts of AudiFi are affected (frontend, backend, smart contracts)
- **Steps to reproduce**: Clear, step-by-step instructions
- **Proof of concept**: Code or screenshots demonstrating the vulnerability
- **Impact assessment**: How an attacker could exploit this issue
- **Suggested fix**: If you have ideas for remediation

### Response Timeline

We aim to respond to security reports within:
- **Initial acknowledgment**: 24 hours
- **Severity assessment**: 72 hours
- **Resolution timeline**: Based on severity (see below)

| Severity | Target Resolution |
|----------|------------------|
| Critical | 24-48 hours |
| High | 7 days |
| Medium | 30 days |
| Low | 90 days |

## Scope

### In Scope

- AudiFi web application (audifi.io)
- AudiFi API endpoints
- Smart contracts (Master Contracts, Dividend Contracts, Artist Coin)
- Authentication and authorization mechanisms
- Payment processing flows
- V Studio access controls

### Out of Scope

- Third-party services (Stripe, blockchain nodes, email providers)
- Social engineering attacks
- Denial of service attacks
- Issues requiring physical access
- Issues in dependencies (report to upstream maintainers)

## Security Documentation

For detailed security architecture and guidelines, see:
- [Security Documentation](./docs/security/README.md)
- [Threat Model](./docs/security/audifi-threat-model.md)
- [Incident Response](./docs/security/audifi-incident-response.md)

## Bug Bounty Program

We are working on establishing a formal bug bounty program. Details will be announced when available.

## Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, data destruction, or service disruption
- Only interact with accounts you own or have explicit permission to test
- Do not exploit vulnerabilities beyond what is necessary to demonstrate the issue
- Report vulnerabilities promptly and allow reasonable time for remediation

We will not pursue legal action against researchers who follow these guidelines.

## Contact

- Security Reports: security@audifi.io (TBD)
- General Inquiries: support@audifi.io (TBD)
