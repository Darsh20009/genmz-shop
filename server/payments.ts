/**
 * Payment Gateway Integration Service
 * Handles Tamara and Tabby payment processing
 */

interface PaymentSession {
  sessionId: string;
  redirectUrl: string;
  status: "created" | "approved" | "declined" | "pending";
  orderId: string;
  amount: number;
  currency: string;
  createdAt: Date;
  paymentId?: string;
}

interface TabbyConfig {
  publicKey: string;
  secretKey: string;
  merchantCode: string;
  apiUrl: string;
}

interface TamaraConfig {
  apiToken: string;
  publicKey: string;
  notificationKey: string;
  apiUrl: string;
}

const paymentSessions = new Map<string, PaymentSession>();

export class PaymentGateway {
  private tabbyConfig: TabbyConfig;
  private tamaraConfig: TamaraConfig;

  constructor() {
    this.tabbyConfig = {
      publicKey: "pk_019ae3ec-731c-b78c-d098-00ef225c5a4c",
      secretKey: "sk_019ae3ec-731c-b78c-d098-00efc3f0e60b",
      merchantCode: "zid_sa",
      apiUrl: "https://api.tabby.ai/api/v2",
    };

    this.tamaraConfig = {
      apiToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiJkZWVmZDU4Yi04ZTIzLTRhODctODY5MS02ZTRiYWMzZTVmYmIiLCJ0eXBlIjoibWVyY2hhbnQiLCJzYWx0IjoiN2Q4ZjM3OGItNTQ3Ni00OGZjLTkzZWItOTExMzBmNWVkNjU4Iiwicm9sZXMiOlsiUk9MRV9NRVJDSEFOVCJdLCJpc010bHMiOmZhbHNlLCJpYXQiOjE3Njg2Mjg3NjgsImlzcyI6IlRhbWFyYSBQUCJ9.faF9q4pTvG_lRxVAeW6wkyU_uF5RLLYi_WKdp7wemZEdW0TQFj43FKEJQppOq-MwQxwocljaFVkacugQNq6vrqaS60g8Hej6odmbY8kCpO4BWdiG2h8C8u3YTwT1cefwFBGCfv7qgvT_Ateb3hHAvD2n2jGSk8v3W_6uW1Gyw5rpAeWluFpO2g0L3GSY5QzaubveeMvArdlTrFw7ymwznK7lFUvzY2yJyRuLxEd6QF1Xris5Yg9D_qI-HHjO124Ipm3f5Teyp7fVrqa8zLoObs1aTWcyvo2PSRO2FogyRHUE1igbAjRYTVLF3VnrIjHeAveskY_vy-gJmmX3nyBIjg",
      publicKey: "e56d8ae9-bb47-408b-8451-959ba5ef25c7",
      notificationKey: "8e28db53-d568-460a-a42d-ac51d546d501",
      apiUrl: "https://api.tamara.co",
    };
  }

  isTabbyConfigured(): boolean {
    return !!(this.tabbyConfig.publicKey && this.tabbyConfig.secretKey && this.tabbyConfig.merchantCode);
  }

  isTamaraConfigured(): boolean {
    return !!(this.tamaraConfig.apiToken);
  }

  getTabbyPublicKey(): string {
    return this.tabbyConfig.publicKey;
  }

  getTabbyMerchantCode(): string {
    return this.tabbyConfig.merchantCode;
  }

  /**
   * Create Tabby checkout session using v2 API
   */
  async createTabbySession(orderData: {
    orderId: string;
    amount: number;
    items: any[];
    customer: any;
    shippingAddress: any;
    successUrl: string;
    failureUrl: string;
    cancelUrl: string;
  }): Promise<PaymentSession> {
    const sessionId = `tabby_${orderData.orderId}_${Date.now()}`;

    if (!this.isTabbyConfigured()) {
      throw new Error("Tabby is not configured. Please add API keys.");
    }

    // Ensure customer data exists and is valid
    const customer = orderData.customer || {};
    const name = customer?.name || customer?.firstName || "Customer";
    const phone = customer?.phone || "+966500000000";
    const email = customer?.email || "customer@example.com";

    // Ensure items is an array with valid data
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    if (items.length === 0) {
      items.push({ title: "Order", name: "Order", quantity: 1, price: orderData.amount });
    }

    const payload = {
      payment: {
        amount: orderData.amount.toFixed(2),
        currency: "SAR",
        description: `Order ${orderData.orderId}`,
        buyer: {
          phone: phone,
          email: email,
          name: name || "Customer",
        },
        buyer_history: {
          registered_since: new Date().toISOString(),
          loyalty_level: 0,
        },
        order: {
          tax_amount: "0.00",
          shipping_amount: "0.00",
          discount_amount: "0.00",
          updated_at: new Date().toISOString(),
          reference_id: orderData.orderId,
          items: items.map((item: any) => {
            const itemName = item?.title || item?.name || item?.productName || "Product";
            return {
              title: itemName,
              description: item?.color ? `${item.color} - ${item.size}` : (item?.description || ""),
              quantity: item?.quantity || 1,
              unit_price: (item?.price || 0).toFixed(2),
              discount_amount: "0.00",
              reference_id: item?.variantSku || item?.productId || item?.sku || "item",
              category: "Fashion",
            };
          }),
        },
        shipping_address: {
          city: orderData.shippingAddress?.city || "الرياض",
          address: orderData.shippingAddress?.street || "العنوان",
          zip: orderData.shippingAddress?.zip || "12345",
        },
      },
      lang: "ar",
      merchant_code: this.tabbyConfig.merchantCode || "zid_sa",
      merchant_urls: {
        success: orderData.successUrl,
        cancel: orderData.cancelUrl,
        failure: orderData.failureUrl,
      },
    };

    console.log("[Tabby] Creating checkout session for order:", orderData.orderId);
    console.log("[Tabby] Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${this.tabbyConfig.apiUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.tabbyConfig.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log("[Tabby] API Response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("[Tabby] API Error:", data);
        throw new Error(data.error?.message || data.message || "Failed to create Tabby session");
      }

      if (data.status === "rejected") {
        console.error("[Tabby] Checkout rejected:", data.rejection_reason);
        throw new Error(`Tabby rejected: ${data.rejection_reason || "Customer not eligible"}`);
      }

      const redirectUrl = data.configuration?.available_products?.installments?.[0]?.web_url || 
                         data.payment?.checkout_url ||
                         data.checkout_url;

      if (!redirectUrl) {
        console.error("[Tabby] No redirect URL in response:", data);
        throw new Error("No checkout URL returned from Tabby");
      }

      const session: PaymentSession = {
        sessionId,
        redirectUrl,
        status: "created",
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: "SAR",
        createdAt: new Date(),
        paymentId: data.id || data.payment?.id,
      };

      paymentSessions.set(sessionId, session);
      console.log("[Tabby] Session created successfully:", session.sessionId);
      
      return session;
    } catch (error: any) {
      console.error("[Tabby] Error creating session:", error);
      throw error;
    }
  }

  /**
   * Create Tamara checkout session
   */
  async createTamaraSession(orderData: {
    orderId: string;
    amount: number;
    currency?: string;
    items: any[];
    customer: any;
    shippingAddress: any;
    successUrl: string;
    failureUrl: string;
    cancelUrl: string;
  }): Promise<PaymentSession> {
    const sessionId = `tamara_${orderData.orderId}_${Date.now()}`;
    const currency = orderData.currency || "SAR";

    if (!this.isTamaraConfigured()) {
      throw new Error("Tamara is not configured. Please add API token.");
    }

    // Ensure customer and address data exists
    const customer = orderData.customer || {};
    const shipping = orderData.shippingAddress || {};
    
    // Parse name safely with multiple fallbacks
    const fullName = (customer?.name || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Customer").trim();
    const nameParts = fullName.split(" ").filter((n: string) => n.length > 0);
    const firstName = customer?.firstName || nameParts[0] || "Customer";
    const lastName = customer?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer");

    // Ensure items is valid
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    if (items.length === 0) {
      items.push({ title: "Order", name: "Order", quantity: 1, price: orderData.amount });
    }

    const payload = {
      order_reference_id: orderData.orderId,
      order_number: orderData.orderId,
      total_amount: {
        amount: orderData.amount,
        currency,
      },
      description: `Order ${orderData.orderId}`,
      country_code: "SA",
      payment_type: "PAY_BY_INSTALMENTS",
      instalments: 4,
      locale: "ar_SA",
      items: items.map((item: any) => {
        const itemName = item?.title || item?.name || item?.productName || "Product";
        return {
          reference_id: item?.variantSku || item?.productId || item?.sku || "item",
          type: "physical",
          name: itemName,
          sku: item?.variantSku || item?.productId || item?.sku || "SKU",
          quantity: item?.quantity || 1,
          total_amount: {
            amount: (item?.price || 0) * (item?.quantity || 1),
            currency,
          },
        };
      }),
      consumer: {
        first_name: firstName || "Customer",
        last_name: lastName || "Customer",
        phone_number: customer?.phone || "+966500000000",
        email: customer?.email || "customer@example.com",
      },
      shipping_address: {
        first_name: firstName || "Customer",
        last_name: lastName || "Customer",
        line1: shipping?.street || "Address",
        city: shipping?.city || "Riyadh",
        country_code: "SA",
      },
      merchant_url: {
        success: orderData.successUrl,
        failure: orderData.failureUrl,
        cancel: orderData.cancelUrl,
        notification: `https://${process.env.DOMAIN || "localhost:5000"}/api/payments/tamara/webhook`,
      },
    };

    console.log("[Tamara] Creating checkout session for order:", orderData.orderId);

    try {
      const response = await fetch(`${this.tamaraConfig.apiUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.tamaraConfig.apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log("[Tamara] API Response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("[Tamara] API Error:", JSON.stringify(data, null, 2));
        throw new Error(data.message || `Tamara API error: ${response.status} ${response.statusText}`);
      }

      const session: PaymentSession = {
        sessionId,
        redirectUrl: data.checkout_url,
        status: "created",
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency,
        createdAt: new Date(),
        paymentId: data.order_id,
      };

      paymentSessions.set(sessionId, session);
      console.log("[Tamara] Session created successfully:", session.sessionId);
      
      return session;
    } catch (error: any) {
      console.error("[Tamara] Error creating session:", error);
      throw error;
    }
  }

  /**
   * Capture Tabby payment after approval
   */
  async captureTabbyPayment(paymentId: string, amount: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.tabbyConfig.apiUrl}/payments/${paymentId}/captures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.tabbyConfig.secretKey}`,
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[Tabby] Capture failed:", data);
        return false;
      }

      console.log("[Tabby] Payment captured:", paymentId);
      return true;
    } catch (error) {
      console.error("[Tabby] Capture error:", error);
      return false;
    }
  }

  /**
   * Handle Tabby webhook
   */
  handleTabbyWebhook(payload: any): { success: boolean; orderId?: string; paymentId?: string } {
    try {
      const { id, status, order } = payload;
      const orderId = order?.reference_id;

      console.log(`[Tabby] Webhook received - Payment: ${id}, Status: ${status}, Order: ${orderId}`);

      if (status === "AUTHORIZED" || status === "CLOSED") {
        return { success: true, orderId, paymentId: id };
      } else if (status === "REJECTED" || status === "EXPIRED") {
        console.error(`[Tabby] Payment failed for order: ${orderId}`);
        return { success: false, orderId, paymentId: id };
      }

      return { success: true, orderId, paymentId: id };
    } catch (error) {
      console.error("[Tabby] Webhook error:", error);
      return { success: false };
    }
  }

  /**
   * Handle Tamara webhook
   */
  handleTamaraWebhook(payload: any, signature?: string): { success: boolean; orderId?: string } {
    try {
      const { event_type, order_id, order_reference_id } = payload;
      const orderId = order_reference_id || order_id;

      console.log(`[Tamara] Webhook received - Event: ${event_type}, Order: ${orderId}`);

      if (event_type === "order_approved") {
        return { success: true, orderId };
      } else if (event_type === "order_declined" || event_type === "order_expired") {
        console.error(`[Tamara] Payment failed for order: ${orderId}`);
        return { success: false, orderId };
      }

      return { success: true, orderId };
    } catch (error) {
      console.error("[Tamara] Webhook error:", error);
      return { success: false };
    }
  }

  getSession(sessionId: string): PaymentSession | undefined {
    return paymentSessions.get(sessionId);
  }

  updateSessionStatus(sessionId: string, status: "approved" | "declined" | "pending"): void {
    const session = paymentSessions.get(sessionId);
    if (session) {
      session.status = status;
    }
  }
}

export const paymentGateway = new PaymentGateway();
