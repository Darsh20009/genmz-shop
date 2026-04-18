import axios from "axios";

const MOYASAR_API_KEY = process.env.MOYASAR_API_KEY;
const MOYASAR_API_URL = "https://api.moyasar.com/v1";

export interface MoyasarPaymentRequest {
  amount: number; // In Halalas (e.g. 100.00 SAR = 10000)
  currency: "SAR";
  description: string;
  callback_url: string;
  metadata?: Record<string, any>;
}

export const moyasarService = {
  async createPayment(request: MoyasarPaymentRequest) {
    if (!MOYASAR_API_KEY) {
      throw new Error("MOYASAR_API_KEY is not configured");
    }

    try {
      const response = await axios.post(
        `${MOYASAR_API_URL}/payments`,
        {
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          callback_url: request.callback_url,
          metadata: request.metadata,
          source: {
            type: "creditcard", // Default to credit card for initialization via SDK or direct
          },
        },
        {
          auth: {
            username: MOYASAR_API_KEY,
            password: "",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Moyasar Create Payment Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async getPayment(paymentId: string) {
    if (!MOYASAR_API_KEY) {
      throw new Error("MOYASAR_API_KEY is not configured");
    }
    try {
      const response = await axios.get(`${MOYASAR_API_URL}/payments/${paymentId}`, {
        auth: {
          username: MOYASAR_API_KEY,
          password: "",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Moyasar Get Payment Error:", error.response?.data || error.message);
      throw error;
    }
  },
};
