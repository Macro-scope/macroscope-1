'use client';
import { supabase } from '../../lib/supabaseClient';
import { Button, Input, Tabs, message, Modal, Form } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa6';
import { LoginLogo } from '@/components/icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { sendWelcomeEmail } from '../../lib/zeptomail';

const { TabPane } = Tabs;

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : 'https://macroscope-so-nextjs.vercel.app/dashboard';

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    console.warn('ReCAPTCHA site key is not configured');
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) message.error('Error during sign in: ' + error.message);
  };

  const handleOtpRequest = async () => {
    if (!email) {
      message.error('Please enter your email');
      return;
    }

    if (!recaptchaToken) {
      message.error('Please complete the reCAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          captchaToken: recaptchaToken,
        },
      });

      if (error) throw error;

      setShowOtpInput(true);
      message.success('Check your email for the OTP code!');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      message.error('Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;
      console.log('data', data);
      // Check if user exists in your users table
      const { data: existingUser } = await supabase
        .from('users')
        .select()
        .eq('user_id', data.user?.id)
        .single();

      if (!existingUser) {
        setShowNameModal(true);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      message.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        throw new Error('Authentication error: User not found');
      }

      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email.toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Database check error: ${checkError.message}`);
      }

      if (existingUser) {
        message.info('User already exists');
        router.push('/dashboard');
        return;
      }

      // Create new user with the correct schema
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          email: email.toLowerCase(),
          created_at: new Date().toISOString(),
          avatar_url: user.user_metadata.avatar_url || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert Error:', insertError);
        throw new Error(`Failed to create user: ${insertError.message}`);
      }

      // await sendWelcomeEmail(email.toLowerCase(), name.trim()).catch(error => {
      //   console.error('Failed to send welcome email:', error);
      // });
      try {
        const response = await fetch('/api/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            name: name.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to send welcome email: ${
              errorData.error || 'Unknown error'
            }`
          );
        }

        console.log('Welcome email sent successfully');
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Continue execution even if email fails
      }
      message.success('Welcome to Macroscope!');
      // setName('');
      // setEmail('');
      // setOtp('');
      // setRecaptchaToken(null);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error in handleNameSubmit:', error);
      message.error(error.message || 'Failed to create user');

      if (error.message.includes('Authentication error')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
      setShowNameModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <div className="w-full max-w-[400px] mt-20">
        <div className="text-center  flex flex-col gap-2">
          {/* <LoginLogo className="mx-auto mb-4" /> */}
          <h1 className="text-3xl font-[500]">Welcome to Macroscope!</h1>
          <div>Get Started - Log-in or create a new account</div>
        </div>
      </div>

      <div className="w-full max-w-[400px] space-y-6 flex-grow flex flex-col justify-center">
        <div className="space-y-4">
          {showNameModal ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="large"
                />
              </div>
              <Button
                onClick={handleNameSubmit}
                loading={loading}
                type="primary"
                block
                size="large"
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleGoogleLogin}
                size="large"
                block
                className="flex items-center justify-center gap-2 h-[40px] border-gray-200"
              >
                <FaGoogle className="text-[16px]" />
                <span>Continue with Google</span>
              </Button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                    disabled={showOtpInput}
                    className="h-[40px]"
                  />
                </div>

                {!showOtpInput &&
                  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                    <ReCAPTCHA
                      sitekey="6LfIlY4qAAAAAEtEim_pHapgHV-L7rZskn0yXEp_"
                      onChange={(token) => setRecaptchaToken(token)}
                      className="flex justify-center"
                    />
                  )}

                {showOtpInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      size="large"
                      className="h-[40px]"
                    />
                  </div>
                )}

                <Button
                  onClick={showOtpInput ? verifyOtp : handleOtpRequest}
                  loading={loading}
                  type="primary"
                  block
                  size="large"
                  disabled={showOtpInput ? otp.length === 0 : !recaptchaToken}
                >
                  {showOtpInput ? 'Verify OTP' : 'Get OTP'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center text-sm absolute bottom-2 text-gray-500 mt-8">
        <a href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        {' & '}
        <a href="#" className="text-blue-600 hover:underline">
          Terms of Service
        </a>
        <p>We never share your data or misuse it in any way.</p>
      </div>
    </div>
  );
};
// ssss
export default Login;
