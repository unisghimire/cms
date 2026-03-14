# Security

## Do not commit secrets

- **Never** commit `.env` or any file containing:
  - Supabase **service role key**
  - API keys, passwords, or tokens
- Use `.env.example` as a template and keep real values in local `.env` (already in `.gitignore`).
- If you accidentally commit secrets, rotate them immediately (e.g. regenerate keys in Supabase Dashboard) and remove the data from git history.

## Reporting vulnerabilities

If you find a security issue, please open a private security advisory on GitHub or contact the maintainers responsibly.
