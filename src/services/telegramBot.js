class TelegramBot {
  constructor(bot, walletMonitor, dbService) {
    this.bot = bot;
    this.walletMonitor = walletMonitor;
    this.dbService = dbService;
  }

  setupCommands() {
    this.bot.command('start', this.handleStart.bind(this));
    this.bot.command('help', this.handleHelp.bind(this));
    this.bot.command('addwallet', this.handleAddWallet.bind(this));
    this.bot.command('removewallet', this.handleRemoveWallet.bind(this));
    this.bot.command('wallets', this.handleListWallets.bind(this));
    this.bot.command('status', this.handleStatus.bind(this));
  }

  setupMiddleware() {
    this.bot.on('text', this.handleText.bind(this));
  }

  async handleStart(ctx) {
    const welcomeMessage = `
🚀 Welcome to WalletChainAlertBot!

I'm your real-time blockchain wallet monitor. I can:
• Monitor Bitcoin, Ethereum, and TRC20 USDT wallets
• Send instant transaction alerts
• Track wallet balances and activity
• Provide 24/7 blockchain monitoring

Type /help to get started!
    `;
    await ctx.reply(welcomeMessage);
  }

  async handleHelp(ctx) {
    const helpMessage = `
📚 Available Commands:

/start - Start the bot
/help - Show this help message
/addwallet <address> <type> - Add a wallet to monitor
  Types: bitcoin, ethereum, trc20
/removewallet <address> - Stop monitoring a wallet
/wallets - List all monitored wallets
/status - Check bot and monitoring status

Examples:
/addwallet 1A1z7agoat2CYWFQ3pxtzjqCC91Px8D75w bitcoin
/addwallet 0x742d35Cc6634C0532925a3b844Bc152e4e0c4fbe ethereum
    `;
    await ctx.reply(helpMessage);
  }

  async handleAddWallet(ctx) {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) {
      return ctx.reply('❌ Usage: /addwallet <address> <type>');
    }
    
    const [address, type] = args;
    try {
      await this.walletMonitor.addWallet(address, type, ctx.from.id);
      await ctx.reply(`✅ Wallet added: ${address} (${type})`);
    } catch (error) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  }

  async handleRemoveWallet(ctx) {
    const address = ctx.message.text.split(' ').slice(1).join(' ');
    try {
      await this.walletMonitor.removeWallet(address);
      await ctx.reply(`✅ Wallet removed: ${address}`);
    } catch (error) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  }

  async handleListWallets(ctx) {
    try {
      const wallets = await this.dbService.getWalletsByUserId(ctx.from.id);
      if (wallets.length === 0) {
        return ctx.reply('📭 No wallets monitored yet. Use /addwallet to add one!');
      }
      
      let message = '📊 Your Monitored Wallets:\n\n';
      wallets.forEach((wallet, index) => {
        message += `${index + 1}. ${wallet.address}\n   Type: ${wallet.type}\n   Added: ${new Date(wallet.createdAt).toLocaleDateString()}\n\n`;
      });
      await ctx.reply(message);
    } catch (error) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  }

  async handleStatus(ctx) {
    try {
      const status = await this.walletMonitor.getStatus();
      const statusMessage = `
📈 Bot Status:
• Monitoring: ${status.isMonitoring ? '🟢 Active' : '🔴 Inactive'}
• Active Wallets: ${status.activeWallets}
• Last Check: ${new Date(status.lastCheck).toLocaleString()}
• Total Alerts: ${status.totalAlerts}
      `;
      await ctx.reply(statusMessage);
    } catch (error) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  }

  async handleText(ctx) {
    await ctx.reply('💬 I didn\'t understand that. Type /help for available commands.');
  }
}

module.exports = TelegramBot;