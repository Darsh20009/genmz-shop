import axios from "axios";

interface MoyasarPaymentRequest {
  amount: number; // in halalas
  currency: string;
  description: string;
  callback_url: string;
  metadata?: Record<string, any>;
}

export class MoyasarService {
  private secretKey: string;
  private apiUrl: string = "https://api.moyasar.com/v1";

  constructor() {
    this.secretKey = process.env.MOYASAR_API_KEY || "";
    if (!this.secretKey) {
      console.warn("[MOYASAR] Warning: MOYASAR_API_KEY is not set in environment variables.");
    }
  }

  private get authHeader() {
    return {
      Authorization: `Basic ${Buffer.from(this.secretKey + ":").toString("base64")}`,
    };
  }

  async createPayment(data: MoyasarPaymentRequest) {
    if (!this.secretKey) {
      throw new Error("Moyasar API Key is not configured");
    }

    try {
      const response = await axios.post(`${this.apiUrl}/payments`, data, {
        headers: this.authHeader,
      });
      return response.data;
    } catch (error: any) {
      console.error("[MOYASAR] Create Payment Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create payment with Moyasar");
    }
  }

  async fetchPayment(id: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/${id}`, {
        headers: this.authHeader,
      });
      return response.data;
    } catch (error: any) {
      console.error("[MOYASAR] Fetch Payment Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch payment from Moyasar");
    }
  }
}

export const moyasarService = new MoyasarService();
