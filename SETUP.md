# WalletChainAlertBot - Setup Guide

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A Telegram Bot Token (from BotFather)
- API keys for:
  - Etherscan (for Ethereum monitoring)
  - Blockchair (for Bitcoin monitoring)
  - Alchemy or Infura (optional, for RPC)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/osemengerecords-commits/WalletChainAlertBot.git
cd WalletChainAlertBot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your:
- Telegram Bot Token
- API keys for blockchain services
- Database configuration (if using MongoDB)

### 4. Run the Bot

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## Docker Setup

### Using Docker Compose
```bash
docker-compose up -d
```

This will start:
- WalletChainAlertBot
- MongoDB database

### Manual Docker Build
```bash
docker build -t walletchainalertbot .
docker run --env-file .env walletchainalertbot
```

## Getting API Keys

### Telegram Bot Token
1. Talk to @BotFather on Telegram
2. Create a new bot with /newbot
3. Copy your token

### Etherscan API Key
1. Visit https://etherscan.io/apis
2. Sign up for a free account
3. Create an API key

### Blockchair API Key
1. Visit https://blockchair.com/api
2. Sign up for free access
3. Get your API key

## Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
WalletChainAlertBot/
├── src/
│   ├── index.js                 # Main entry point
│   ├── services/
│   │   ├── telegramBot.js       # Telegram bot handler
│   │   ├── walletMonitor.js     # Wallet monitoring logic
│   │   ├── blockchainService.js # Blockchain API interactions
│   │   └── databaseService.js   # Database operations
│   └── utils/
│       ├── logger.js            # Logging utility
│       └── validators.js        # Input validation
├── tests/                        # Test files
├── .github/workflows/            # GitHub Actions CI/CD
├── .env.example                  # Environment template
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose setup
└── package.json                  # Dependencies and scripts
```

## Supported Blockchains

- **Bitcoin**: Full address monitoring and transaction alerts
- **Ethereum**: Real-time token transfer and transaction monitoring
- **TRC20**: Tron network USDT and token monitoring

## Troubleshooting

### Bot doesn't respond
- Check TELEGRAM_BOT_TOKEN in .env
- Ensure bot is started with /start command

### Wallet monitoring not working
- Verify API keys are correct
- Check network connectivity
- Review logs for error messages

### Database connection issues
- Ensure MongoDB is running (if using Docker Compose: `docker-compose up`)
- Check DB_HOST and DB_PORT in .env

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

## License

MIT License - see LICENSE file for details