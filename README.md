# My API

This API serves my personal website [esantini.com](esantini.com) and it's subdomains (if any yet).

Being hosted in a **Raspberry Pi**, it includes dependencies made specific for it and for the **Sense HAT** attachment.

# Setup PM2

With PM2 you can keep the API running after device restarts

Install PM2 with `sudo yarn global add pm2`

### Configure PM2

Run `pm2 startup` and copy-paste the line provided.

### Run API

From the project's main folder run the following commands:

Run the NodeJS API server:

```bash
NODE_ENV=production PORT=3001 pm2 start src/api.js
```

### Save Configuration

If your current configuration is working properly you should save it

Save your configurations `pm2 save`

View running processes `pm2 list`
View API logs `pm2 logs server`

More commands: [https://pm2.keymetrics.io/docs/usage/process-management/](https://pm2.keymetrics.io/docs/usage/process-management/)
