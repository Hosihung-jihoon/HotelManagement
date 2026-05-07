import axiosClient from './axiosClient';
import axios from 'axios';
import { VietQR } from 'vietqr';

const vietQR = new VietQR({
  clientID: 'de8a0804-a76d-41e5-8ad6-31503ce7d5f4',
  apiKey: '17c29f09-4ea2-4417-b9c2-7f020d35de42',
});

const paymentService = {
  createMomoPayment: async (amount, orderInfo, bookingId) => {
    const response = await axiosClient.post('/payment/momo/create', {
      amount: parseFloat(amount),
      orderInfo: orderInfo,
      bookingId: bookingId || 0
    });
    return response.data; // Should contain payUrl
  },

  createVietQR: async (amount, bookingCode) => {
    const response = await axios.post('https://api.vietqr.io/v2/generate', {
      accountNo: '113366668888',
      accountName: 'KHACH SAN LUXURY',
      acqId: '970415',
      addInfo: `Thanh toan phong ${bookingCode}`,
      amount: parseFloat(amount),
      template: 'compact'
    }, {
      headers: {
        'x-client-id': 'de8a0804-a76d-41e5-8ad6-31503ce7d5f4', // Placeholder or from user
        'x-api-key': '17c29f09-4ea2-4417-b9c2-7f020d35de42',    // Placeholder or from user
        'Content-Type': 'application/json'
      }
    });
    return response.data; // Returns { data: { qrDataURL: "..." } }
  },

  getVietQRLink: ({ bank, accountName, accountNumber, amount, memo, template }) => {
    return vietQR.genQuickLink({
      bank: bank || '970415',
      accountName: accountName || 'ADMIN',
      accountNumber: accountNumber || '113366668888',
      amount: amount,
      memo: memo,
      template: template || 'compact2',
      media: '.jpg'
    });
  }
};

export default paymentService;
