const { Telegraf, session } = require('telegraf');
const { message } = require('telegraf/filters');
require('dotenv').config();

const WalletMonitor = require('./services/walletMonitor');
const TelegramBot = require('./services/telegramBot');
const BlockchainService = require('./services/blockchainService');
const DatabaseService = require('./services/databaseService');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Initialize services
const dbService = new DatabaseService();
const blockchainService = new BlockchainService();
const walletMonitor = new WalletMonitor(blockchainService, dbService);
const telegramBot = new TelegramBot(bot, walletMonitor, dbService);

// Session middleware
bot.use(session());

// Telegram bot commands setup
telegramBot.setupCommands();
telegramBot.setupMiddleware();

// Start monitoring
walletMonitor.startMonitoring();

// Launch bot
bot.launch().then(() => {
  console.log('✅ WalletChainAlertBot started successfully');
}).catch(err => {
  console.error('❌ Error starting bot:', err);
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));