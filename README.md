# X Growth Assistant

Free cloud workflow for a new X account:

- auto-generate native English tweets
- auto-randomize posting windows
- auto-deduplicate and moderate
- auto-create GitHub Issues as the durable notification record
- send tweet text, suggested hashtags, and image idea directly through QQ SMTP email
- open a prefilled X composer
- you can copy the full package on mobile and post in X

## What changed

This version does **not** use the paid X API.

Instead, it:

1. generates the tweet in the cloud
2. creates a GitHub Issue with the ready-to-post tweet
3. sends the same reminder directly to your QQ mailbox by SMTP
4. gives you one link to open a prefilled X compose page
5. you do the final publish tap in X

That keeps the workflow free while still letting your computer stay off.

## Best use for a new X account

The content strategy is tuned for:

- strong first-line hooks
- practical AI insights
- no hard sell
- no outbound link in the tweet body by default
- profile-click oriented writing
- suggested image angle for each post
- optional hashtags kept separate from the main copy

Recommended growth setup:

- put your website link in your X profile once
- keep tweet bodies mostly link-free
- use the profile as the conversion layer
- use images only when they sharpen the point, not as decoration

## Fast start

```powershell
npm install
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

Then fill `.env`:

- `GITHUB_TOKEN` for local live tests only
- `GITHUB_REPOSITORY` for local live tests only
- `NOTIFICATION_EMAIL=1278028133@qq.com`
- `SMTP_USER=1278028133@qq.com`
- `SMTP_PASS` as your QQ Mail SMTP authorization code
- `DATABASE_URL`
- `WEBSITE_URL`
- `X_PROFILE_URL`

In GitHub Actions you do not need to create a GitHub token secret. The workflow uses the built-in `GITHUB_TOKEN`.

`OPENAI_API_KEY` is optional in this version.  
If you leave it empty, the project uses the built-in free local content generator.

## Commands

- `npm run setup`
- `npm run healthcheck`
- `npm run dev:plan`
- `npm run dev:once`
- `npm run notify:test`
- `npm test`
- `npm run check`

## How the notification reminder works

When a post is due, the bot creates a GitHub Issue and sends a direct QQ SMTP email with:

- the tweet text
- suggested hashtags
- suggested image direction
- a short note on why it may perform well
- your website/profile context
- one click link to open the prefilled X composer

GitHub Issues remain the durable record. QQ SMTP is the direct email path to `1278028133@qq.com`.

## Required setup you still need to do once

You said you want to move as little as possible, so here is the true minimum:

1. put your website URL into your X profile manually once
2. deploy this repo to GitHub
3. make sure GitHub email notifications are enabled for the repository
4. add GitHub Secrets and Variables
5. run the workflow manually with `mode=test-notification`

After that, your computer can stay off.

## GitHub secrets

- `OPENAI_MODEL`
- `EMBEDDING_MODEL`
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`
- `SMTP_PASS`

`OPENAI_API_KEY` is optional here too.

## GitHub variables

- `WEBSITE_URL`
- `X_PROFILE_URL`
- `NOTIFICATION_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_FROM`
- `SMTP_TO`
- `SMTP_HELO_NAME`
- `SMTP_TIMEOUT_MS`
- `BOT_TIMEZONE`
- `POST_WINDOW_START_HOUR`
- `POST_WINDOW_END_HOUR`
- `DAILY_POST_MIN`
- `DAILY_POST_MAX`
- `MIN_GAP_MINUTES`
- `MAX_GAP_MINUTES`
- `LOOKBACK_POST_LIMIT`
- `ENABLE_SEMANTIC_DEDUP`
- `KEYWORD_SIMILARITY_THRESHOLD`
- `SEMANTIC_SIMILARITY_THRESHOLD`
- `TOPIC_WEIGHTS`
- `TONE_POOL`
- `ANGLE_POOL`
- `DRY_RUN`

## Recommended defaults for a new account

```env
BOT_TIMEZONE=America/New_York
POST_WINDOW_START_HOUR=9
POST_WINDOW_END_HOUR=19
DAILY_POST_MIN=2
DAILY_POST_MAX=3
MIN_GAP_MINUTES=180
MAX_GAP_MINUTES=360
DRY_RUN=false
```

## Important note

This free version cannot publish fully automatically to X without using paid X API access or higher-risk browser automation.

The final post click remains manual inside X.

## Free mode

If you do not provide `OPENAI_API_KEY`, the bot will still work:

- tweet generation uses the built-in local template engine
- keyword dedup still works
- semantic embedding dedup is skipped
- GitHub Issue notification still works
- QQ SMTP email notification works when `SMTP_PASS` is configured
