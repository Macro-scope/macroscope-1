const LEMON_API_KEY = process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY;
const STORE_ID = '132385';
const LOCAL_URL = 'http://localhost:3000';

type CheckoutOptions = {
  embed: boolean;
  media: boolean;
  logo: boolean;
  desc: boolean;
  discount: boolean;
  subscription_preview: boolean;
  button_color: string;
};

type ProductOptions = {
  name: string;
  description: string;
  media: any[];
  redirect_url: string;
  receipt_button_text: string;
  receipt_link_url: string;
  receipt_thank_you_note: string;
  enabled_variants: any[];
};

type CheckoutData = {
  email: string;
  name: string;
  billing_address: any[];
  tax_number: string;
  discount_code: string;
  custom: {
    mapId: string;
    userId: string;
  };
  variant_quantities: any[];
};

export const createCheckout = async (
  variantId: string, 
  mapId: string, 
  userId: string,
  email: string,
  name: string
): Promise<string> => {
  try {
    console.log('Creating checkout with:', { variantId, mapId, userId, email, name });

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          store_id: parseInt(STORE_ID),
          variant_id: parseInt(variantId),
          custom_price: null,
          product_options: {
            name: "Map Subscription",
            description: "Subscribe to access premium map features",
            media: [],
            redirect_url: `${LOCAL_URL}/dashboard/?success=true&mapId=${mapId}&userId=${userId}`,
            receipt_button_text: "Return to Dashboard",
            receipt_link_url: `${LOCAL_URL}/dashboard/subscriptions?success=true&mapId=${mapId}&userId=${userId}`,
            receipt_thank_you_note: "Thank you for your subscription!",
            enabled_variants: []
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
            desc: true,
            discount: true,
            subscription_preview: true,
            button_color: "#000000"
          },
          checkout_data: {
            email: email,
            name: name,
            billing_address: [],
            tax_number: "0",
            discount_code: "0",
            custom: {
              mapId,
              userId
            },
            variant_quantities: []
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: STORE_ID
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    };

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEMON_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lemonsqueezy error:', errorData);
      throw new Error(`Checkout creation failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
};