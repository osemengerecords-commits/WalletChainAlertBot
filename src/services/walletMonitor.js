class WalletMonitor {
  constructor(blockchainService, dbService) {
    this.blockchainService = blockchainService;
    this.dbService = dbService;
    this.monitoringInterval = process.env.MONITOR_CHECK_INTERVAL || 30000;
    this.isMonitoring = false;
    this.monitoringProcess = null;
    this.lastTransactionHash = {};
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting wallet monitoring...');
    
    this.monitoringProcess = setInterval(async () => {
      try {
        await this.checkAllWallets();
      } catch (error) {
        console.error('❌ Monitoring error:', error);
      }
    }, this.monitoringInterval);
  }

  async stopMonitoring() {
    if (this.monitoringProcess) {
      clearInterval(this.monitoringProcess);
      this.isMonitoring = false;
      console.log('⏹️ Wallet monitoring stopped');
    }
  }

  async checkAllWallets() {
    const wallets = await this.dbService.getAllWallets();
    
    for (const wallet of wallets) {
      try {
        const transactions = await this.blockchainService.getTransactions(wallet.address, wallet.type);
        await this.processTransactions(wallet, transactions);
      } catch (error) {
        console.error(`Error checking wallet ${wallet.address}:`, error);
      }
    }
  }

  async processTransactions(wallet, transactions) {
    for (const transaction of transactions) {
      const txHash = transaction.hash || transaction.tx_hash;
      
      if (txHash !== this.lastTransactionHash[wallet.address]) {
        this.lastTransactionHash[wallet.address] = txHash;
        
        await this.dbService.saveTransaction(wallet, transaction);
        await this.notifyUsers(wallet, transaction);
      }
    }
  }

  async addWallet(address, type, userId) {
    const validation = this.blockchainService.validateAddress(address, type);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    await this.dbService.addWallet(address, type, userId);
    console.log(`✅ Wallet added: ${address}`);
  }

  async removeWallet(address) {
    await this.dbService.removeWallet(address);
    delete this.lastTransactionHash[address];
    console.log(`✅ Wallet removed: ${address}`);
  }

  async notifyUsers(wallet, transaction) {
    const users = await this.dbService.getUsersByWallet(wallet.address);
    
    for (const user of users) {
      const message = this.formatTransactionAlert(wallet, transaction);
      console.log(`📢 Sending alert to user ${user.telegramId}`);
      // Alert sending logic here
    }
  }

  formatTransactionAlert(wallet, transaction) {
    return `
🔔 Transaction Alert!

Wallet: ${wallet.address.substring(0, 10)}...
Type: ${transaction.type}
Amount: ${transaction.value}
Hash: ${transaction.hash}
Time: ${new Date().toLocaleString()}
    `;
  }

  async getStatus() {
    const wallets = await this.dbService.getAllWallets();
    return {
      isMonitoring: this.isMonitoring,
      activeWallets: wallets.length,
      lastCheck: new Date(),
      totalAlerts: await this.dbService.getAlertCount(),
    };
  }
}

module.exports = WalletMonitor;