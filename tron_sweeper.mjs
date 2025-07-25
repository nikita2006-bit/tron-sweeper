import TronWeb from 'tronweb';
import axios from 'axios';

// TRON network setup
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.trongrid.io');
const solidityNode = new HttpProvider('https://api.trongrid.io');
const eventServer = new HttpProvider('https://api.trongrid.io');

// Configurable recipient and USDT contract
const recipientAddress = '';
const usdtContractAddress = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj' // USDT (TRC20);
const discordWebhook = '';

// Add as many wallets as needed here:
const wallets = [
    {
        privateKey: '',
        address: '',
        processing: false
    },
    {
        privateKey: '',
        address: '',
        processing: false
    },
    // Add more wallet objects here...
];

const minUsdtToSend = 10; // Minimum USDT to trigger transfer (in normal units, not Sun)
const minUsdtToSendSun = minUsdtToSend * 1_000_000;


// Send USDT
async function sendUsdt(tronWeb, senderAddress, amount) {
    try {
        const usdtContract = await tronWeb.contract().at(usdtContractAddress);
        const transaction = await usdtContract.transfer(recipientAddress, amount).send({ from: senderAddress });

        console.log(`USDT transaction from ${senderAddress}:`, transaction);

        if (transaction) {
            const usdtAmount = tronWeb.fromSun(amount);
            await axios.post(discordWebhook, {
                username: 'Tron_Sweeper',
                avatar_url: 'https://imgur.com/',
                embeds: [{
                    title: "USDT Transaction Successful",
                    description: `Transaction of ${usdtAmount} USDT from ${senderAddress} was successful.`,
                    color: 7419530
                }]
            });

            console.log('Discord notification sent.');
        }
    } catch (error) {
        if (error.response?.status === 429) {
            console.log('Rate limit hit. Retrying after 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
            console.error('sendUsdt error:', error.message || error);
        }
    }
}

// Check and send for a specific wallet
async function checkAndSendTransaction(wallet) {
    if (wallet.processing) return;
    wallet.processing = true;

    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, wallet.privateKey);
    try {
        const trxBalanceSun = await tronWeb.trx.getBalance(wallet.address);
        const minTrxRequiredSun = tronWeb.toSun(5); // Leave at least 5 TRX

        if (trxBalanceSun < minTrxRequiredSun) {
            console.log(`Not enough TRX in ${wallet.address}. Needs at least 5 TRX to send USDT.`);
            wallet.processing = false;
            return;
        }

        const usdtContract = await tronWeb.contract().at(usdtContractAddress);
        const usdtBalance = await usdtContract.balanceOf(wallet.address).call();
        const usdtAmountToSend = usdtBalance.toNumber();

        if (usdtAmountToSend >= minUsdtToSendSun) {
            console.log(`Sending ${tronWeb.fromSun(usdtAmountToSend)} USDT from ${wallet.address}`);
            await sendUsdt(tronWeb, wallet.address, usdtAmountToSend);
        } else {
            console.log(` Balance too low (${tronWeb.fromSun(usdtAmountToSend)} USDT). Skipping ${wallet.address}`);
        }
    } catch (err) {
        console.error(`Error for wallet ${wallet.address}:`, err.message || err);
    }

    wallet.processing = false;
}



// Start sweeping process
wallets.forEach(wallet => {
    setInterval(() => checkAndSendTransaction(wallet), 5000);
});
