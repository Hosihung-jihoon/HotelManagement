import axiosClient from './axiosClient';
import axios from 'axios';
import { VietQR } from 'vietqr';

const vietQR = new VietQR({
  clientID: import.meta.env.VITE_VIETQR_CLIENT_ID,
  apiKey: import.meta.env.VITE_VIETQR_API_KEY,
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
        'x-client-id': import.meta.env.VITE_VIETQR_CLIENT_ID,
        'x-api-key': import.meta.env.VITE_VIETQR_API_KEY, 
        'Content-Type': 'application/json'
      }
    });
    return response.data; // Returns { data: { qrDataURL: "..." } }
  },

  createMomoPayment: async (amount, orderInfo, bookingId) => {
    const response = await axiosClient.post('/payment/Momo/create', {
      bookingId,
      amount,
      orderInfo
    });
    return response.data; // Returns { payUrl: "..." }
  },

  createVnPayPayment: async (amount, bookingId) => {
    const response = await axiosClient.post('/payment/vnpay', {
      bookingId,
      amount
    });
    return response.data; // Returns { paymentUrl: "..." }
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
