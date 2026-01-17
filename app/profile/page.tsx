'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthProvider';
import ProfileField from '@/components/ProfileField';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    state: '',
    country: '',
    downloads: 0,
  });

  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          downloads: data.downloads || 0,
        });
      }
    };

    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsEditing(false);
    setShowPopup(true);

    await supabase
      .from('users')
      .update({
        name: profile.name,
        mobile: profile.mobile,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      })
      .eq('email', profile.email);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading || !user) return null;

  const Field = ({
    label,
    name,
    type = 'text',
  }: {
    label: string;
    name: keyof typeof profile;
    type?: string;
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={profile[name] as string}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-base text-gray-700 whitespace-pre-line">{profile[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Navbar />

      <main className="flex-grow py-20 px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="text-center">
            <FaUserCircle className="text-6xl text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-500">Registered User</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField  label="Name"  name="name"  value={profile.name}  isEditing={isEditing}  onChange={handleChange}/>
            <ProfileField label="Mobile" name="mobile" value={profile.mobile} isEditing={isEditing} type="tel" onChange={handleChange} />
            <ProfileField label="City" name="city" value={profile.city} isEditing={isEditing} onChange={handleChange} />
            <ProfileField label="State" name="state" value={profile.state} isEditing={isEditing} onChange={handleChange} />
            <ProfileField label="Country" name="country" value={profile.country} isEditing={isEditing} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-600">Downloads</label>
              <p className="text-base text-gray-700">{profile.downloads}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                isEditing
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {showPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-blue-200 shadow-lg px-6 py-3 rounded-lg text-center text-sm text-blue-700 font-medium z-50">
          Changes saved successfully.
        </div>
      )}
    </div>
  );
}