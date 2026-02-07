# Deploying to the Cloud

Your server is packaged in Docker and can accept remote connections. Time to put it on the internet using **Railway**.

## Step 1: Create a Railway Account

Go to [railway.app](https://railway.app/) and sign up for a free account. You can use your GitHub account to sign in.

## Step 2: Install the Railway CLI

```bash
npm install -g @railway/cli
```

Then log in:

```bash
railway login
```

This opens a browser window for authentication. After logging in, you will be returned to the terminal.

## Step 3: Prepare Your Project

Make sure your project is a Git repository. If it is not already:

```bash
cd /path/to/api-server
git init
git add .
git commit -m "Initial commit"
```

## Step 4: Create a Railway Project

```bash
railway init
```

Follow the prompts to create a new project. Railway will link your local folder to a cloud project.

## Step 5: Set Environment Variables

Your API keys need to be set on Railway (remember, we excluded `.env` from Docker):

```bash
railway variables set OPENWEATHER_API_KEY=your_key_here
railway variables set NEWS_API_KEY=your_key_here
```

## Step 6: Deploy

```bash
railway up
```

This command:
1. Uploads your code to Railway
2. Builds the Docker container in the cloud
3. Starts your server

After a minute or two, you will see a success message with a deployment URL.

## Step 7: Get Your Public URL

```bash
railway domain
```

This gives your server a public URL like `your-project.up.railway.app`. Your MCP server is now live on the internet.

## Step 8: Connect Claude Desktop

Update your Claude Desktop config to connect to the remote server:

```json
{
  "mcpServers": {
    "api-server-cloud": {
      "url": "https://your-project.up.railway.app/sse"
    }
  }
}
```

Restart Claude Desktop. It will now connect to your cloud server instead of running a local process.

## Step 9: Verify

Try the same prompts as before:
- "What is the weather in Tokyo?"
- "Give me the latest news about AI"

Everything should work exactly as before, but now the server is running in the cloud.

## Monitoring Your Deployment

Railway provides a dashboard at [railway.app](https://railway.app/) where you can:
- View logs from your server
- Check memory and CPU usage
- See how many requests are being handled
- Update environment variables

If something goes wrong, the logs are the first place to check. They show everything your server prints, including error messages.

## Cost

Railway's free tier includes $5 of monthly credit, which is more than enough for personal projects and testing. Your server only uses resources when it is handling requests, so costs stay low.
