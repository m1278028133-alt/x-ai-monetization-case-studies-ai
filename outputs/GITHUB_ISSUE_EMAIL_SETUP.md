# GitHub Issue + QQ SMTP Notification Setup

This project uses GitHub Issues as the durable notification record and QQ Mail SMTP as the direct email path.

When a post is due, GitHub Actions creates a GitHub Issue and sends the same reminder to `1278028133@qq.com` through `smtp.qq.com`.

## 1. Enable repository email notifications

1. Open the GitHub repository.
2. Make sure the repository has Issues enabled.
3. Click **Watch**.
4. Choose **All Activity** or another setting that emails you for new Issues.
5. Make sure your GitHub account email notifications are enabled.

The reminder target noted in generated Issues is:

```text
1278028133@qq.com
```

GitHub controls the actual delivery address through your account settings.

## 2. Configure QQ SMTP

Add this GitHub Actions secret:

```text
SMTP_PASS=<QQ Mail SMTP authorization code>
```

Add these GitHub Actions variables:

```text
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=1278028133@qq.com
SMTP_FROM=1278028133@qq.com
SMTP_TO=1278028133@qq.com
SMTP_HELO_NAME=x-growth-assistant.local
SMTP_TIMEOUT_MS=20000
```

## 3. Required workflow permission

The workflow includes:

```yaml
permissions:
  contents: write
  issues: write
```

No extra GitHub token secret is needed. GitHub Actions provides `GITHUB_TOKEN` automatically.

## 4. Test immediately

In GitHub Actions, run the **X Bot** workflow manually and choose:

```text
mode=test-notification
```

That creates one test Issue immediately and sends one direct SMTP email to QQ Mail.

The workflow also mentions the repository owner in each Issue body, which gives GitHub another notification reason beyond repository watching.
