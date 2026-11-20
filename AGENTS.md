# Security & Secret Management Policy

## STRICT ZERO-TOLERANCE RULE: NEVER COMMIT SECRETS TO GIT
Under NO circumstances should any secrets, credentials, API keys, private tokens, passwords, database credentials, or private certificates ever be committed or pushed to any Git repository or version control.

### Prohibited Items in Commits
- **API Keys & Tokens**: Weather API keys, OpenAI/Gemini keys, AWS credentials, auth secrets.
- **Passwords & Connection Strings**: Database passwords/URIs, SSH keys.
- **Environment & Secret Files**: `.env`, `.env.local`, `.env.production` (only `.env.example` with dummy values may be committed).

### Enforcement Rules for Agents
1. **Always Externalize Secrets**:
   - Store API keys and credentials in `.env.local` or deployment server environment variables.
2. **Always Check `.gitignore` First**:
   - Before referencing or writing any configuration file containing sensitive data, verify that the file pattern is explicitly listed and ignored in `.gitignore`.
3. **Pre-Commit Verification**:
   - Before executing `git add` or `git commit`, inspect staged diffs (`git diff --staged`) to guarantee no API keys, credentials, or sensitive tokens are included.
4. **Immediate Remediation if Discovered**:
   - If an uncommitted secret is found in a tracked file, immediately externalize it to gitignored configuration before staging or committing.
