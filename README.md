# Tron USDT Sweeper

**Tron Sweeper** is a Node.js script that monitors multiple TRON wallets and automatically transfers USDT (TRC20) balances to a central recipient address when a user-defined threshold is reached. It ensures that a minimum amount of TRX remains in the wallet to cover network fees and sends notifications to Discord via webhook.

---

## ⚙️ Features

- ✅ Sweeps USDT from unlimited wallets
- 🔐 Keeps 5 TRX in each wallet for gas
- 📊 Sends USDT only when balance ≥ custom threshold
- 🔁 Runs in the background, checks every 5 seconds
- 📢 Notifies a Discord channel on successful transfers

---

## 🔧 Configuration

Open the script file `prime_sweeper.mjs` and edit:

```js
const recipientAddress = 'YOUR_MAIN_WALLET';
const usdtContractAddress = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj'; // USDT (TRC20)
const discordWebhook = 'YOUR_DISCORD_WEBHOOK_URL';
const minUsdtToSend = 10; // Minimum USDT to sweep

const wallets = [
  {
    privateKey: 'YOUR_PRIVATE_KEY_1',
    address: 'YOUR_ADDRESS_1',
    processing: false
  },
  {
    privateKey: 'YOUR_PRIVATE_KEY_2',
    address: 'YOUR_ADDRESS_2',
    processing: false
  }
  // Add more if needed
];
