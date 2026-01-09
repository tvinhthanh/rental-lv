import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export interface CreatePaymentIntentDto {
  invoiceId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentGatewayService = {
  /**
   * Tạo Stripe Payment Intent
   */
  createStripePaymentIntent: async (data: CreatePaymentIntentDto): Promise<PaymentIntentResponse> => {
    const response = await api.post<PaymentIntentResponse>("/payment-gateway/stripe/create-intent", data);
    return response;
  },

  /**
   * Lấy thông tin payment intent
   */
  getPaymentIntent: async (paymentIntentId: string) => {
    return api.get(`/payment-gateway/stripe/payment-intent/${paymentIntentId}`);
  },

  /**
   * Tạo refund
   */
  createRefund: async (paymentId: string, amount?: number) => {
    return api.post("/payment-gateway/stripe/refund", { paymentId, amount });
  },
};
