class DatabaseService {
  constructor() {
    this.wallets = [];
    this.users = [];
    this.transactions = [];
    this.alerts = [];
    // In production, use MongoDB or PostgreSQL
  }

  async addWallet(address, type, userId) {
    const wallet = {
      id: Date.now().toString(),
      address,
      type,
      userId,
      createdAt: new Date(),
      isActive: true,
    };
    
    this.wallets.push(wallet);
    return wallet;
  }

  async removeWallet(address) {
    this.wallets = this.wallets.filter(w => w.address !== address);
  }

  async getAllWallets() {
    return this.wallets.filter(w => w.isActive);
  }

  async getWalletsByUserId(userId) {
    return this.wallets.filter(w => w.userId === userId && w.isActive);
  }

  async getUsersByWallet(address) {
    const wallet = this.wallets.find(w => w.address === address);
    if (!wallet) return [];
    
    return this.users.filter(u => u.id === wallet.userId);
  }

  async saveTransaction(wallet, transaction) {
    const txRecord = {
      id: Date.now().toString(),
      walletAddress: wallet.address,
      walletType: wallet.type,
      txHash: transaction.hash || transaction.tx_hash,
      data: transaction,
      createdAt: new Date(),
    };
    
    this.transactions.push(txRecord);
    return txRecord;
  }

  async getAlertCount() {
    return this.alerts.length;
  }
}

module.exports = DatabaseService;