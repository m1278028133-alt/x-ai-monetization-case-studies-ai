# PushPlus + WeChat Setup

## 1. Create PushPlus account

1. Open [PushPlus login](https://www.pushplus.plus/push1.html)
2. Log in with WeChat QR code

## 2. Bind WeChat

After login, PushPlus uses your WeChat login identity for message delivery.  
If you can log in with WeChat and enter the PushPlus personal center, the basic binding is already in place.

If needed, also open the official PushPlus WeChat account and follow it once.

## 3. Get your token

You can get your token in either of these two ways:

1. In PushPlus web console, open your personal center and copy the `用户token`
2. In the PushPlus official WeChat account, reply with `token`

Use the **user token**. PushPlus docs say open API calls should use the user token.

## 4. Put it into this project

Open `.env` and fill:

```env
PUSHPLUS_TOKEN=your_token_here
```

## 5. Test locally

```powershell
npm run healthcheck
```

When `DRY_RUN=false`, due posts will be sent to your WeChat through PushPlus.

## Official references

- [PushPlus Open API](https://www.pushplus.plus/doc/guide/openApi.html)
- [PushPlus Message API](https://www.pushplus.plus/doc/guide/api.html)
- [User token vs message token](https://www.pushplus.plus/doc/help/token.html)
- [PushPlus FAQ](https://pushplus.plus/doc/guide/help.html)
