<div align="center">
    <h1>Updaown's UBG</h1>
    <p>Updaown's UBG is a web proxy with a Clean and Sleek UI and easy-to-use menus. Our goal is to provide the best user experience to everyone.</p>
</div>

> [!IMPORTANT]
> If you fork this project, consider giving it a star in the original repository!

**Join Our [Discord Community](https://github.com/updaown-hecker/Updaowns-UBG/tree/master) for support, more links, and an active community!**

## Features

- About:Blank Cloaking
- Tab Cloaking
- Wide collection of apps & games
- Clean, Easy-to-use UI
- Inspect Element
- Various Themes
- Password Protection (Optional)
- Built-in Tab System
- Now.gg Support (W.I.P)
- Fast Speeds
- Geforce NOW Support
- ** Themes & Particles**

![Front Page Preview](static/assets/display/front-page.png)

## Deployment

> [!IMPORTANT]
> You **cannot** deploy to static web hosts, including Netlify, Cloudflare Pages, and GitHub Pages.

### Password Protection

1. Go to the `config.js` file and set `challenge` to **true**. Then, set the environment variable as follows:
2. For PNPM: Run either `config=true pnpm start` or `$env:config=true; pnpm start`, depending on your server.
3. For Bun: Run either `config=true bun start` or `$env:config=true; bun start` if you prefer Bun.
4. For NPM: Run either `config=true npm start` or `$env:config=true; npm start` if you prefer NPM.

### Server Deployment

You must run these commands on your server:

```bash
git clone https://github.com/updaown-hecker/Updaowns-UBG/tree/master
cd Updaown's UBG
```
<h1>Bun:</h1>
If you are using Bun, run the following commands:

```bash 
bun i
bun start
``` 
<h1>PNPM</h1>
If you are using pnpm, run the following commands:

```bash
pnpm i
pnpm start
```

<h1> NPM</h1>

```bash 
npm i
npm run start
```
<h1>Updating</h1>

```bash 
cd Updaown's UBG
git pull --force --allow-unrelated-histories # This may overwrite your local changes
```
<hr>

<h3>Deployment Alternatives:</h3>
For more deployment options, join our Discord Server for various ways to deploy Updaown's UBG. This includes methods of deploying to Render/OnRender.

What happened to Replit Deployment?
As of January 1st, 2024, Replit is no longer free. Try GitHub Codespaces instead.

<h3>GitHub Codespaces:</h3>
[!NOTE] If you're setting the port below 1023, then you must run sudo PORT=1023.

1. Create a GitHub account if you haven't already.

2. Click "Code" (green button) and then "Create Codespace on main."

3. In the terminal at the bottom, paste pnpm i && pnpm start.

4. Respond to the application popup by clicking "Make public."

[!IMPORTANT] Make sure you click the "Make public." button, or the proxy won't function properly.
If you get a Range Error, go back and make sure you clicked Make public!

Access the deployed website from the ports tab.

<strong>For subsequent uses in the same codespace, just run pnpm start.</strong>

- Solution for if there is no popup.
Run pnpm i, and before pnpm start, prepend PORT=8080, replacing 8080 with another port. For example, PORT=6969 pnpm start.

- If this does not work, then you can prepend $env:PORT=8080;, replacing 8080 with another port. For example, $env:PORT=6969; pnpm start.

- Go to the ports tab, Click Forward A Port, and type the port number.

- Right-click Visibility and set Port Visibility to Public.

<h1>Report Issues:</h1>
If you encounter problems, open an issue on GitHub, and we'll address it promptly.

<div style="margin-bottom: 20px;"></div>

[!TIP] If you're having trouble, don't hesitate to reach out to us on Discord for personalized support.
