const axios = require('axios');

class BlockchainService {
  constructor() {
    this.etherscanUrl = 'https://api.etherscan.io/api';
    this.blockchairUrl = 'https://api.blockchair.com';
  }

  validateAddress(address, type) {
    const patterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
      trc20: /^T[a-zA-Z0-9]{33}$/,
    };

    if (!patterns[type]) {
      return { valid: false, message: `Unknown wallet type: ${type}` };
    }

    if (!patterns[type].test(address)) {
      return { valid: false, message: `Invalid ${type} address` };
    }

    return { valid: true };
  }

  async getTransactions(address, type) {
    try {
      if (type === 'ethereum') {
        return await this.getEthereumTransactions(address);
      } else if (type === 'bitcoin') {
        return await this.getBitcoinTransactions(address);
      } else if (type === 'trc20') {
        return await this.getTRC20Transactions(address);
      }
    } catch (error) {
      console.error(`Error fetching ${type} transactions:`, error);
      throw error;
    }
  }

  async getEthereumTransactions(address) {
    const params = {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 0,
      endblock: 99999999,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY,
    };

    const response = await axios.get(this.etherscanUrl, { params });
    
    if (response.data.status === '1') {
      return response.data.result.slice(0, 5).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        type: 'transfer',
        timestamp: tx.timeStamp,
      }));
    }
    return [];
  }

  async getBitcoinTransactions(address) {
    const params = {
      limit: 5,
    };

    const response = await axios.get(`${this.blockchairUrl}/bitcoin/addresses/${address}`, { params });
    
    if (response.data.data) {
      const txs = response.data.data[address]?.transactions || [];
      return txs.map(txHash => ({
        tx_hash: txHash,
        type: 'transfer',
      }));
    }
    return [];
  }

  async getTRC20Transactions(address) {
    // TRC20 (USDT on Tron) transactions
    const params = {
      address: address,
      limit: 5,
    };

    try {
      const response = await axios.get(`https://apilist.tronscan.org/api/token_trc20/transfers`, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching TRC20 transactions:', error);
      return [];
    }
  }

  async getWalletBalance(address, type) {
    try {
      if (type === 'ethereum') {
        return await this.getEthereumBalance(address);
      } else if (type === 'bitcoin') {
        return await this.getBitcoinBalance(address);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }

  async getEthereumBalance(address) {
    const params = {
      module: 'account',
      action: 'balance',
      address: address,
      tag: 'latest',
      apikey: process.env.ETHERSCAN_API_KEY,
    };

    const response = await axios.get(this.etherscanUrl, { params });
    return response.data.result ? (response.data.result / 1e18).toFixed(4) : '0';
  }

  async getBitcoinBalance(address) {
    const response = await axios.get(`${this.blockchairUrl}/bitcoin/addresses/${address}`);
    return response.data.data ? response.data.data[address].balance : '0';
  }
}

module.exports = BlockchainService;