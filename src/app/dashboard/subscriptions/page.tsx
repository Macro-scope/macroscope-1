"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Check } from 'lucide-react';
import { createCheckout } from '@/lib/lemonsqueezy';
import CustomLayout from '@/layout/CustomLayout';
import { PRODUCT_VARIANTS } from '@/lib/lemon-squeezy-config';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Map {
  map_id: string;
  name: string;
  subscriptions?: {
    id: string;
    status: string;
    product_name: string;
    trial_ends_at: string | null;
    renews_at: string | null;
    current_period_end: string | null;
    is_active: boolean;
  }[];
}

interface PlanDetails {
  name: string;
  price: string;
  features: string[];
  variantId: string;
}

const MapBadge = ({ subscriptions }: { subscriptions?: Map['subscriptions'] }) => {
  if (!subscriptions?.length) return null;

  const activeSubscription = subscriptions.find(sub => 
    ['active', 'on_trial'].includes(sub.status)
  );

  if (!activeSubscription) return null;

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    if (activeSubscription.status === 'on_trial') {
      return 'Trial';
    }
    return activeSubscription.product_name;
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(activeSubscription.status)}`}>
      {getStatusText()}
    </span>
  );
};

export default function SubscriptionsPage() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<'creator' | 'creatorPro'>('creator');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState('');

  useEffect(() => {
    fetchUserMaps();
  }, []);

  const fetchUserMaps = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: maps, error } = await supabase
      .from('maps')
      .select(`
        *,
        subscriptions (
          id,
          status,
          product_name,
          trial_ends_at,
          renews_at,
          current_period_end,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maps:', error);
      return;
    }

    const subscribedMaps = maps.filter(map => 
      map.subscriptions?.some((sub :any) => 
        ['active', 'on_trial'].includes(sub.status)
      )
    );
    
    console.log('Maps with active subscriptions:', subscribedMaps);
    console.log('All maps with subscription details:', maps);

    setMaps(maps);
  };

  const handleSubscribe = async (planType: 'free' | 'creator' | 'creatorPro') => {
    if (planType === 'free') {
      // Handle free plan subscription
      return;
    }

    const plan = PRODUCT_VARIANTS[`${planType.toUpperCase()}_${billingPeriod.toUpperCase()}` as keyof typeof PRODUCT_VARIANTS];
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleMapSelect = async (mapId: string) => {
    if (!selectedPlan?.variantId) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check for ANY existing subscription (not just active ones)
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('map_id', mapId)
        .eq('user_id', user.id)
        .single();

      if (existingSub) {
        // Update existing subscription record instead of creating new one
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'inactive',
            variant_id: selectedPlan.variantId,
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error('Failed to update subscription record');
        }
      } else {
        // Create new subscription record only if one doesn't exist
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            map_id: mapId,
            status: 'inactive',
            variant_id: selectedPlan.variantId,
            is_active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          throw new Error('Failed to create subscription record');
        }
      }

      // Create Lemonsqueezy checkout with user email and name
      const checkoutUrl = await createCheckout(
        selectedPlan.variantId,
        mapId,
        user.id,
        user.email || '',
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'
      );

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const getCurrentPlan = () => {
    const key = `${selectedPlanType.toUpperCase()}_${billingPeriod.toUpperCase()}`;
    return PRODUCT_VARIANTS[key as keyof typeof PRODUCT_VARIANTS];
  };

  return (
    <CustomLayout>
      <div className="flex-1 overflow-y-auto pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6 mt-4 text-center">Upgrade</h1>
          
          {/* Billing Period Selector */}
          <div className="flex justify-center mb-3">
            <div className="bg-gray-100  rounded-[15px] inline-flex">
              <button
                className={`px-4 py-2 rounded-[15px] ${billingPeriod === 'monthly' ? ' bg-black text-white shadow' : ''}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Pay Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-[15px] ${billingPeriod === 'yearly' ? 'bg-black text-white shadow' : ''}`}
                onClick={() => setBillingPeriod('yearly')}
              >
                Pay Yearly
                
              </button>
              <button
                className={`px-4 py-2 rounded-[15px] ${billingPeriod === 'lifetime' ? 'bg-black text-white shadow' : ''}`}
                onClick={() => setBillingPeriod('lifetime')}
              >
                Pay Once
              </button>
               </div>
            
          </div>
          <div className='flex justify-center align-middle'>
          <div className="text-xs text-gray-600 ml-3 mb-4">2 months free</div>
          </div>
          

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Hobby Plan */}
            <div>
              
            </div>
            <div className="bg-white rounded-lg pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2 mt-2">Hobby</h2>
              <div className="mb-6">
                <div className="text-4xl font-bold">FREE</div>
                <p className="">Unlimited projects (Fair Use)</p>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg py-6  text-center ">
              <h2 className="text-xl font-semibold mb-2 mr-4">Pro</h2>
              <div className="mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">
                    {billingPeriod === 'monthly' && '$12'}
                    {billingPeriod === 'yearly' && '$10'}
                    {billingPeriod === 'lifetime' && '$199'}
                  </span>
                  <span className=" ml-1">
                    {billingPeriod !== 'lifetime' ? '/mo' : ''}
                  </span>
                </div>
                <p className="mt-1">
                  per project, 
                  {billingPeriod === 'monthly' && 'billed monthly'}
                  {billingPeriod === 'yearly' && 'billed annually'}
                  {billingPeriod === 'lifetime' && 'one-time payment'}
                </p>
              </div>
              <button
                onClick={() => handleSubscribe('creator')}
                className=" w-40 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Select Plan
              </button>
              {billingPeriod !== 'lifetime' && (
                <p className="text-center mt-2 text-[18px]">15 day free trial</p>
              )}
            </div>

            {/* Pro+ Plan */}
            <div className="bg-white rounded-lg py-6 text-center mr-24">
              <h2 className="text-xl font-semibold mb-2 mr-4 ">Pro+</h2>
              <div className="mb-6">
                <div className="flex items-baseline justify-center ">
                  <span className="text-4xl font-bold ">
                    {billingPeriod === 'monthly' && '$24'}
                    {billingPeriod === 'yearly' && '$20'}
                    {billingPeriod === 'lifetime' && '$399'}
                  </span>
                  <span className=" ml-1">
                    {billingPeriod !== 'lifetime' ? '/mo' : ''}
                  </span>
                </div>
                <p className="mt-1">
                  per project, 
                  {billingPeriod === 'monthly' && 'billed monthly'}
                  {billingPeriod === 'yearly' && 'billed annually'}
                  {billingPeriod === 'lifetime' && 'one-time payment'}
                </p>
              </div>
              <button
                onClick={() => handleSubscribe('creatorPro')}
                className=" w-40 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Select Plan
              </button>
              {billingPeriod !== 'lifetime' && (
                <p className="text-center mt-2 text-[18px]">15 day free trial</p>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-6xl mx-auto mt-16">
            <h3 className="text-xl font-semibold mb-8">Features</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Features</TableHead>
                  <TableHead className="text-center">Hobby</TableHead>
                  <TableHead className="text-center">Pro</TableHead>
                  <TableHead className="text-center">Pro+</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Custom themes</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Export as Image</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Embed in your website</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Publish with Macroscope subdomain</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                  </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Publish with custom domain</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remove Macroscope branding</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                  <span className=" inline-flex items-center justify-center w-8 h-8 rounded">
    <Check className="w-5 h-5" />
  </span>                                    </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Map Selection Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {/* <DialogTrigger asChild>
              <button className="hidden">Open Modal</button>
            </DialogTrigger> */}
            <DialogContent className='w-[400px] bg-white text-black'>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl">Select a map to upgrade</h2>
               
              </div>
              
              {maps.length === 0 ? (
                <p className="text-gray-500">No maps found. Create a map first.</p>
              ) : (
                <div className="space-y-4">
                  <Select onValueChange={setSelectedMapId} value={selectedMapId} defaultValue="" >
                    <SelectTrigger className="w-full p-3 border rounded-lg  focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white">
                    <SelectValue placeholder="Choose a map..."   />
                    </SelectTrigger>
                    <SelectContent className='bg-white text-black'>
                      {maps.filter(map => !map.subscriptions?.some(sub => ['active', 'on_trial'].includes(sub.status)))
                        .map((map) => (
                          <SelectItem className='bg-white text-black' key={map.map_id} value={map.map_id}>
                            {map.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div  className='flex w-full justify-end'>
                    
                  {/* <button
                    onClick={() => handleMapSelect(selectedMapId)}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    disabled={!selectedMapId}
                  >
                   
                  </button> */}
                  <Button className='bg-black text-white'    disabled={!selectedMapId}  onClick={() => handleMapSelect(selectedMapId)}>
                  Proceed to payment →
                  </Button>
                  </div>
               
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </CustomLayout>
  );
}