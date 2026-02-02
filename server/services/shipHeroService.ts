import axios from "axios";

const SHIPHERO_API_URL = "https://public-api.shiphero.com/graphql";

export class ShipHeroService {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string | null = null;

  constructor() {
    this.apiKey = process.env.SHIPHERO_API_KEY || "";
    this.apiSecret = process.env.SHIPHERO_API_SECRET || "";
  }

  private async getAccessToken() {
    return this.apiKey; 
  }

  async createOrder(order: any) {
    if (!this.apiKey) {
      console.warn("[ShipHero] API Key is missing, skipping order sync");
      return { success: false, message: "API Key missing" };
    }

    // ShipHero GraphQL API usually requires a specific structure. 
    // "Bad token" often means the Bearer token is invalid or the header is wrong.
    // Some versions of ShipHero API use 'x-api-key' instead of Authorization.
    
    const query = `
      mutation {
        order_create(data: {
          order_number: "${order.orderNumber || order.id}"
          order_date: "${new Date(order.createdAt).toISOString()}"
          fulfillment_status: "pending"
          shipping_address: {
            first_name: "${(order.customerName || 'Customer').split(' ')[0]}"
            last_name: "${(order.customerName || 'User').split(' ').slice(1).join(' ') || 'User'}"
            address1: "${order.shippingAddress?.street || ''}"
            city: "${order.shippingAddress?.city || ''}"
            province: "${order.shippingAddress?.city || ''}"
            postal_code: "00000"
            country: "SA"
            phone: "${order.customerPhone || ''}"
          }
          line_items: [
            ${(order.items || []).map((item: any) => `{
              sku: "${item.variantSku || 'NOSKU'}"
              name: "${item.title}"
              quantity: ${item.quantity}
              price: "${item.price}"
            }`).join(',')}
          ]
        }) {
          request_id
          complexity
          order {
            id
            order_number
          }
        }
      }
    `;

    try {
      console.log("[ShipHero] Sending order to ShipHero:", order.orderNumber || order.id);
      const response = await axios.post(
        SHIPHERO_API_URL,
        { query },
        {
          headers: {
            "Authorization": this.apiKey, // ShipHero uses the token directly or with x-api-key
            "Content-Type": "application/json",
            "x-api-key": this.apiKey
          },
        }
      );

      if (response.data.errors) {
        console.error("[ShipHero] GraphQL Errors:", JSON.stringify(response.data.errors));
        throw new Error(response.data.errors[0].message);
      }

      return response.data;
    } catch (error: any) {
      console.error("[ShipHero] Order Creation Error Details:", error.response?.data || error.message);
      throw error;
    }
  }

  async getInventory(sku: string) {
    if (!this.apiKey) return null;
    const query = `
      query {
        inventory(sku: "${sku}") {
          request_id
          complexity
          data {
            edges {
              node {
                sku
                on_hand
                virtual_inventory
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        SHIPHERO_API_URL,
        { query },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("[ShipHero] Inventory Query Error:", error.response?.data || error.message);
      throw error;
    }
  }

  async syncInventoryWithProduct(productId: string) {
    // This would be called by a cron job or manual trigger
    // Implementation for syncing ShipHero stock back to local DB
  }
}

export const shipHeroService = new ShipHeroService();
