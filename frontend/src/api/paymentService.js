import axiosClient from './axiosClient';

const paymentService = {
  createMomoPayment: async (amount, orderInfo, bookingId) => {
    const response = await axiosClient.post('/Momo/create', {
      amount: parseFloat(amount),
      orderInfo: orderInfo,
      bookingId: bookingId || 0
    });
    return response.data; // Should contain payUrl
  },

  createVnPayPayment: async (amount, orderInfo, bookingId) => {
    const response = await axiosClient.post('/payment/vnpay', {
      amount: parseFloat(amount),
      bookingId: bookingId || 0
    });
    return response.data; // Should contain PaymentUrl
  }
};

export default paymentService;
