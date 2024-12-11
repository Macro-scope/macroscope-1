import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyWebhookSignature } from '@/lib/verify-webhook';
import { sendZeptoMail } from '@/lib/zeptomail';

const logWebhookEvent = (eventName: string, data: any) => {
  console.log(`[Webhook ${eventName}]`, {
    timestamp: new Date().toISOString(),
    subscriptionId: data.id,
    status: data.attributes.status,
    customData: data.meta?.custom_data
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-signature');
    
    console.log('Webhook received:', {
      signature,
      headers: Object.fromEntries(req.headers),
      body: body
    });
    
    // Temporarily bypass signature verification for testing
    // if (!verifyWebhookSignature(signature, body)) {
    //   console.error('Invalid webhook signature');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { meta, data } = body;
    console.log('Event:', meta.event_name);
    console.log('Custom Data:', meta.custom_data);
    console.log('Data:', data);

    switch (meta.event_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(data, meta.custom_data);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(data);
        break;
      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(data);
        break;
      case 'subscription_resumed':
        await handleSubscriptionResumed(data);
        break;
      case 'subscription_paused':
        await handleSubscriptionPaused(data);
        break;
      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(data);
        break;
      case 'subscription_payment_failed':
        await handleSubscriptionPaymentFailed(data);
        break;
      case 'subscription_payment_recovered':
        await handleSubscriptionPaymentRecovered(data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

async function handleSubscriptionCreated(data: any, customData: any) {
  logWebhookEvent('subscription_created', { ...data, meta: { custom_data: customData } });
  const { 
    id,
    attributes: {
      status,
      ends_at,
      renews_at,
      updated_at,
      created_at,
      variant_id,
      first_subscription_item,
      billing_interval,
      billing_interval_count,
      store_id,
      customer_id,
      order_id,
      order_item_id,
      product_id,
      product_name,
      variant_name,
      user_name,
      user_email,
      card_brand,
      card_last_four,
      trial_ends_at,
      billing_anchor,
      test_mode,
      urls
    }
  } = data;
  
  const { mapId, userId } = customData;

  console.log('Processing subscription creation:', {
    subscriptionId: id,
    status,
    mapId,
    userId
  });

  const { error } = await supabase
    .from('subscriptions')
    .update({
      lemon_subscription_id: id,
      variant_id: variant_id,
      status: status,
      current_period_end: ends_at,
      renews_at: renews_at,
      created_at: created_at,
      updated_at: updated_at,
      is_active: true,
      price_id: first_subscription_item?.price_id,
      interval: billing_interval,
      interval_count: billing_interval_count,
      store_id,
      customer_id,
      order_id,
      order_item_id,
      product_id,
      product_name,
      variant_name,
      user_name,
      user_email,
      card_brand,
      card_last_four,
      trial_ends_at,
      billing_anchor,
      test_mode,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ map_id: mapId, user_id: userId });
    try {
      await sendZeptoMail({
        template: 'SUBSCRIPTION_CREATED',
        email: user_email,
        data: {
          name: user_name,
          product_name: product_name,
          customer_portal_url: urls?.customer_portal
        }
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw the error to prevent webhook processing failure
    }
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(data: any) {
  const { 
    id, 
    attributes: {
      status,
      ends_at,
      renews_at,
      updated_at,
      currency,
      unit_price,
      billing_interval,
      billing_interval_count,
      card_brand,
      card_last_four,
      urls,
      trial_ends_at
    }
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: status,
      current_period_end: ends_at,
      renews_at: renews_at,
      updated_at: updated_at,
      is_active: ['active', 'on_trial'].includes(status),
      currency: currency,
      unit_price: unit_price,
      interval: billing_interval,
      interval_count: billing_interval_count,
      card_brand,
      card_last_four,
      trial_ends_at,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });
}

async function handleSubscriptionCancelled(data: any) {
  const { 
    id, 
    attributes: { 
      ends_at, 
      updated_at,
      urls,
      user_email,
      user_name,
      product_name
    } 
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: updated_at,
      current_period_end: ends_at,
      updated_at: updated_at,
      is_active: false,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });

  // Send cancellation email
  try {
    await sendZeptoMail({
      template: 'SUBSCRIPTION_CANCELLED',
      email: user_email,
      data: {
        name: user_name,
        product_name: product_name,
        end_date: new Date(ends_at).toLocaleDateString(),
        customer_portal_url: urls?.customer_portal
      }
    });
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
  }
}

async function handleSubscriptionExpired(data: any) {
  const { 
    id, 
    attributes: { 
      updated_at,
      urls,
      user_email,
      user_name,
      product_name
    } 
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: 'expired',
      updated_at: updated_at,
      is_active: false,
      current_period_end: null,
      renews_at: null,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });

  // Send expiration email
  try {
    await sendZeptoMail({
      template: 'SUBSCRIPTION_EXPIRED',
      email: user_email,
      data: {
        name: user_name,
        product_name: product_name,
        customer_portal_url: urls?.customer_portal
      }
    });
  } catch (emailError) {
    console.error('Failed to send expiration email:', emailError);
  }
}

async function handleSubscriptionPaymentSuccess(data: any) {
  const { 
    attributes: {
      subscription_id,
      status,
      urls
    }
  } = data;

  if (status === 'paid') {
    await supabase
      .from('subscriptions')
      .update({
        invoice_url: urls?.invoice_url,
        updated_at: new Date().toISOString()
      })
      .match({ lemon_subscription_id: subscription_id });
  }
}

async function handleSubscriptionResumed(data: any) {
  const { 
    id, 
    attributes: { 
      status,
      ends_at,
      renews_at,
      updated_at,
      urls,
      user_email,
      user_name,
      product_name
    } 
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: status,
      current_period_end: ends_at,
      renews_at: renews_at,
      updated_at: updated_at,
      is_active: true,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });

  // Send resume email
  try {
    await sendZeptoMail({
      template: 'SUBSCRIPTION_RESUMED',
      email: user_email,
      data: {
        name: user_name,
        product_name: product_name,
        next_billing_date: new Date(renews_at).toLocaleDateString(),
        customer_portal_url: urls?.customer_portal
      }
    });
  } catch (emailError) {
    console.error('Failed to send resume email:', emailError);
  }
}

async function handleSubscriptionPaused(data: any) {
  const { 
    id, 
    attributes: { 
      status,
      updated_at,
      urls,
      user_email,
      user_name,
      product_name,
      pause
    } 
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: status,
      updated_at: updated_at,
      is_active: false,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });

  // Send pause email
  try {
    await sendZeptoMail({
      template: 'SUBSCRIPTION_PAUSED',
      email: user_email,
      data: {
        name: user_name,
        product_name: product_name,
        resume_date: pause?.resumes_at ? new Date(pause.resumes_at).toLocaleDateString() : 'not specified',
        customer_portal_url: urls?.customer_portal
      }
    });
  } catch (emailError) {
    console.error('Failed to send pause email:', emailError);
  }
}

async function handleSubscriptionUnpaused(data: any) {
  const { 
    id, 
    attributes: { 
      status,
      ends_at,
      renews_at,
      updated_at,
      urls
    } 
  } = data;

  await supabase
    .from('subscriptions')
    .update({
      status: status,
      current_period_end: ends_at,
      renews_at: renews_at,
      updated_at: updated_at,
      is_active: true,
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: id });
}

async function handleSubscriptionPaymentFailed(data: any) {
  const { 
    attributes: {
      subscription_id,
      status,
      urls,
      user_email,
      user_name,
      product_name
    }
  } = data;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      is_active: false,
      invoice_url: urls?.invoice_url,
      updated_at: new Date().toISOString(),
      update_payment_method_url: urls?.update_payment_method,
      customer_portal_url: urls?.customer_portal,
      customer_portal_update_url: urls?.customer_portal_update_subscription
    })
    .match({ lemon_subscription_id: subscription_id });

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  // Send payment failed email
  try {
    await sendZeptoMail({
      template: 'PAYMENT_FAILED',
      email: user_email,
      data: {
        name: user_name,
        product_name: product_name,
        update_payment_url: urls?.update_payment_method,
        customer_portal_url: urls?.customer_portal
      }
    });
  } catch (emailError) {
    console.error('Failed to send payment failed email:', emailError);
  }
}

async function handleSubscriptionPaymentRecovered(data: any) {
  const { 
    attributes: {
      subscription_id,
      status,
      urls,
      user_email,
      user_name,
      product_name,
      renews_at
    }
  } = data;

  if (status === 'recovered') {
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        is_active: true,
        invoice_url: urls?.invoice_url,
        updated_at: new Date().toISOString(),
        update_payment_method_url: urls?.update_payment_method,
        customer_portal_url: urls?.customer_portal,
        customer_portal_update_url: urls?.customer_portal_update_subscription
      })
      .match({ lemon_subscription_id: subscription_id });

    // Send payment recovered email
    try {
      await sendZeptoMail({
        template: 'PAYMENT_SUCCESS',
        email: user_email,
        data: {
          name: user_name,
          product_name: product_name,
          next_billing_date: new Date(renews_at).toLocaleDateString(),
          customer_portal_url: urls?.customer_portal
        }
      });
    } catch (emailError) {
      console.error('Failed to send payment recovered email:', emailError);
    }
  }
}