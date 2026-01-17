'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';
import GoogleButton from '@/components/GoogleButton';
import { useRouter } from 'next/navigation';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const CITY_MAP: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangalore'],
  // Add more if needed
};

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', mobile: '',
    city: '', state: '', country: 'India', agree: false,
  });
  const [status, setStatus] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'city' && typeof value === 'string' && value.length >= 3 && CITY_MAP[form.state]) {
      const match = CITY_MAP[form.state].filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(match);
    }
  };

  useEffect(() => {
    if (status) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async () => {
    const { name, email, password, mobile, city, state, country, agree } = form;
    const required = [name, email, password, mobile, city, state, country];
    if (required.some((v) => typeof v !== 'string' || v.trim() === ''))
      return setStatus('❗ All fields are required.');

    if (!/^[A-Za-z\s]{2,}$/.test(name)) return setStatus('❗ Name must be at least 2 letters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('❗ Invalid email format.');
    if (!email.endsWith('@gmail.com')) return setStatus('❗ Email must end with @gmail.com.');
    if (password.trim().length < 6) return setStatus('❗ Password must be at least 6 characters.');
    if (!/^[6-9]\d{9}$/.test(mobile)) return setStatus('❗ Mobile must be a valid 10-digit Indian number.');
    if (!/^[A-Za-z\s]+$/.test(city)) return setStatus('❗ City must contain only letters.');
    if (!STATES.includes(state)) return setStatus('❗ Please select a valid state.');
    if (country.toLowerCase() !== 'india') return setStatus('❗ JuggerNotes is only available in India.');
    if (!agree) return setStatus('❗ You must agree to the privacy policy.');

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error('Auth signup error:', authError.message);

        // Handle specific Supabase errors gracefully
        if (authError.message.includes('Email not confirmed')) {
          return setStatus('📧 Please confirm your email from your inbox before logging in.');
        }
        if (authError.message.includes('invalid') || authError.message.includes('Bad Request')) {
          return setStatus('❗ This email address is invalid or not allowed. Please use a valid Gmail ID.');
        }
        if (authError.message.includes('already registered')) {
          return setStatus('❗ Email already registered.');
        }

        return setStatus(`❗ ${authError.message}`);
      }

      // Insert user data into 'users' table after successful signup
      const { error: insertError } = await supabase.from('users').insert({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        mobile: mobile.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        downloads: 0,
        provider: 'email',
      });

      if (insertError) {
        console.error('Insert error:', insertError.message);
        if (insertError.message.includes('duplicate'))
          return setStatus('❗ Email already registered.');
        return setStatus('❗ Failed to save profile. Try again.');
      }

      setStatus('✅ Account created! Check your email to confirm before logging in.');
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      setStatus('❗ Unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl animate-pulse delay-200" />
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-200 z-10 space-y-6 relative">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 tracking-tight leading-tight">
          Create Your <span className="text-purple-600">JuggerNotes</span> Account
        </h1>

        {showAlert && (
          <div
            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-semibold px-4 py-2 rounded-lg border z-50 ${
              status.startsWith('✅')
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-red-50 text-red-700 border-red-300'
            }`}
          >
            {status}
          </div>
        )}

        <div className="space-y-5 text-gray-700 font-medium">
          <Input label="Name" value={form.name} onChange={(v) => handleChange('name', v)} />
          <Input label="Email" value={form.email} onChange={(v) => handleChange('email', v)} />
          <Input label="Password" type="password" value={form.password} onChange={(v) => handleChange('password', v)} />
          <Input label="Mobile" value={form.mobile} onChange={(v) => handleChange('mobile', v)} />

          <label className="block text-sm font-medium text-gray-600">State</label>
          <select
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Select State</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <Input label="City" value={form.city} onChange={(v) => handleChange('city', v)} />
          {citySuggestions.length > 0 && (
            <ul className="text-sm text-gray-600 space-y-1">
              {citySuggestions.map((city) => (
                <li
                  key={city}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => handleChange('city', city)}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}

          <Input label="Country" value={form.country} onChange={(v) => handleChange('country', v)} />

          <Checkbox
            checked={form.agree}
            onChange={(v) => handleChange('agree', v)}
            label={
              <>
                I agree to the{' '}
                <a
                  href="/files/privacy-policy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Privacy Policy
                </a>
              </>
            }
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
          >
            Sign Up
          </button>

          <div className="pt-4">
            <GoogleButton mode="signup" />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <span
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Log In now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
