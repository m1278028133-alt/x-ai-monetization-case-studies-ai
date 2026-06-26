# GitHub Issue Email Notification Setup

This project no longer needs PushPlus, Resend, SMTP, or any paid email service.

When a post is due, GitHub Actions creates a GitHub Issue. GitHub then sends email according to your GitHub account notification settings.

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

## 2. Required workflow permission

The workflow includes:

```yaml
permissions:
  contents: write
  issues: write
```

No extra GitHub token secret is needed. GitHub Actions provides `GITHUB_TOKEN` automatically.

## 3. Test immediately

In GitHub Actions, run the **X Bot** workflow manually and choose:

```text
mode=test-notification
```

That creates one test Issue immediately. If your GitHub notification settings are correct, you should receive the email for that Issue.

The workflow also mentions the repository owner in each Issue body, which gives GitHub another notification reason beyond repository watching.
