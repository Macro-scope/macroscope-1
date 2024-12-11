import { createClient } from '@supabase/supabase-js';
import { sendZeptoMail } from './zeptomail';
import { supabase } from './supabaseClient';

// Function to send reminder emails for trials/subscriptions ending tomorrow
export async function sendEndingReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
  const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  // Check for trials that have ended today and update their status
  const { data: endedTrials, error: endedTrialsError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'on_trial')
    .lte('trial_ends_at', todayEnd.toISOString());

  if (endedTrialsError) {
    console.error('Error fetching ended trials:', endedTrialsError);
  } else {
    for (const subscription of endedTrials || []) {
      try {
        // Update subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .match({ id: subscription.id });

        if (updateError) {
          console.error('Error updating trial status:', updateError);
          continue;
        }

        // Send trial ended email
        await sendZeptoMail({
          template: 'TRIAL_ENDED',
          email: subscription.user_email,
          data: {
            name: subscription.user_name,
            product_name: subscription.product_name,
            end_date: new Date(subscription.trial_ends_at).toLocaleDateString(),
            customer_portal_url: subscription.customer_portal_url,
            update_payment_url: subscription.update_payment_method_url
          }
        });
      } catch (error) {
        console.error('Failed to process ended trial:', error);
      }
    }
  }

  // Check for trials ending tomorrow
  const { data: trialEndings, error: trialError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'on_trial')
    .gte('trial_ends_at', tomorrowStart.toISOString())
    .lte('trial_ends_at', tomorrowEnd.toISOString());

  if (trialError) {
    console.error('Error fetching trial endings:', trialError);
  } else {
    for (const subscription of trialEndings || []) {
      try {
        await sendZeptoMail({
          template: 'TRIAL_ENDING_REMINDER',
          email: subscription.user_email,
          data: {
            name: subscription.user_name,
            product_name: subscription.product_name,
            end_date: new Date(subscription.trial_ends_at).toLocaleDateString(),
            customer_portal_url: subscription.customer_portal_url
          }
        });
      } catch (error) {
        console.error('Failed to send trial ending reminder:', error);
      }
    }
  }

  // Check for subscription endings
  const { data: subscriptionEndings, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('is_active', true)
    .gte('current_period_end', tomorrowStart.toISOString())
    .lte('current_period_end', tomorrowEnd.toISOString());

  if (subError) {
    console.error('Error fetching subscription endings:', subError);
  } else {
    for (const subscription of subscriptionEndings || []) {
      try {
        await sendZeptoMail({
          template: 'SUBSCRIPTION_ENDING_REMINDER',
          email: subscription.user_email,
          data: {
            name: subscription.user_name,
            product_name: subscription.product_name,
            end_date: new Date(subscription.current_period_end).toLocaleDateString(),
            customer_portal_url: subscription.customer_portal_url
          }
        });
      } catch (error) {
        console.error('Failed to send subscription ending reminder:', error);
      }
    }
  }
}