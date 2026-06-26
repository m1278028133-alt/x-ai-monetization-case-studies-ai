# One-Time Launch Checklist

## X side

1. Put your website URL into your X profile
2. Use a clean bio focused on AI workflows / AI insights
3. Pin one high-signal post after your first week

## GitHub notification side

1. Watch the repository on GitHub
2. Enable email notifications for new Issues
3. Confirm your GitHub account can email `1278028133@qq.com`

## Project side

1. Fill `.env`
2. Run:

```powershell
npm install
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
npm run healthcheck
```

## GitHub side

1. Push the project to GitHub
2. Add the secrets from `GITHUB_CONFIG_TEMPLATE.md`
3. Add the variables from `GITHUB_CONFIG_TEMPLATE.md`
4. Enable Actions
5. Run `workflow_dispatch` once manually with `mode=test-notification`
6. Confirm the test Issue and GitHub notification email arrive

## After launch

1. Watch the first 3 days of GitHub Issue reminders
2. Only post the best-looking messages
3. Prefer clean screenshots, mini charts, or short visual explainers as images
4. If a tweet feels too generic, skip it instead of forcing volume
