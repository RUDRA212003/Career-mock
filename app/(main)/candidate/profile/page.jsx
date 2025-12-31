'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Camera, Save, Loader2, ShieldCheck, Zap, Globe, Fingerprint, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfile() {
  const { user, signOut } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({ fullname: '', email: '', picture: null });
  const [originalData, setOriginalData] = useState({});
  
  // Password & CAPTCHA States
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState(""); // The random code generated
  const [userCaptchaInput, setUserCaptchaInput] = useState(""); // What the user types
  const [passwordSaving, setPasswordSaving] = useState(false);

  let provider = null;
  if (typeof window !== 'undefined') {
    try {
      provider = JSON.parse(localStorage.getItem('sb-oqaqnjpovruuqpuohjbp-auth-token'))?.user?.app_metadata?.provider;
    } catch {}
  }
  const isGoogleUser = provider === 'google';

  useEffect(() => { 
    if (user) loadProfileData(); 
    generateCaptcha(); // Generate initial captcha
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      let userData = {
        fullname: user?.name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        picture: user?.picture || null
      };
      if (user?.email) {
        const { data: userRecord, error } = await supabase.from('users').select('name, email, picture').eq('email', user.email).single();
        if (!error && userRecord) {
          userData = { ...userData, fullname: userRecord.name || userData.fullname, picture: userRecord.picture || userData.picture };
        }
      }
      setProfileData(userData);
      setOriginalData(userData);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate a random 6-character alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserCaptchaInput(""); // Clear input on refresh
  };

  const handlePasswordChange = async () => {
    if (userCaptchaInput !== captchaCode) {
      toast.error("CAPTCHA does not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Security Key Updated");
      setPassword("");
      generateCaptcha();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('users').upsert({ email: user.email, name: profileData.fullname, picture: profileData.picture }, { onConflict: 'email' });
      setOriginalData(profileData);
      toast.success('Registry Updated');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => JSON.stringify(profileData) !== JSON.stringify(originalData);

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-12 lg:p-16 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b-2 border-slate-900 pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Profile <span className="text-slate-400">Control</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={signOut} variant="outline" className="h-14 rounded-none border-2 border-slate-900 font-black uppercase text-xs tracking-widest">
              Log_Out
            </Button>
            <Button disabled={!hasChanges() || saving} onClick={handleSave} className="h-14 px-10 rounded-none bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
              {saving ? <Loader2 className="animate-spin" /> : 'Push_Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* PHOTO TILE */}
          <div className="md:col-span-4 bg-white border-2 border-slate-900 p-8 flex flex-col items-center justify-center relative">
            <Avatar className="h-40 w-40 md:h-52 md:w-52 rounded-none border-2 border-slate-900">
              <AvatarImage src={profileData.picture} className="object-cover" />
              <AvatarFallback className="bg-slate-900 text-white text-6xl font-black italic rounded-none">{profileData.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="mt-8 text-2xl font-black uppercase italic tracking-tighter">{profileData.fullname || 'Anonymous'}</h3>
          </div>

          {/* CREDENTIALS & CAPTCHA TILE */}
          <div className="md:col-span-8 bg-white border-2 border-slate-900 p-8 md:p-12 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Legal_Name</Label>
                <Input value={profileData.fullname} onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))} className="h-16 rounded-none border-2 border-slate-100 bg-slate-50 font-bold text-lg" />
              </div>
              <div className="space-y-3 opacity-60">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Email_Address</Label>
                <Input value={profileData.email} disabled className="h-16 rounded-none border-2 border-slate-100 bg-slate-100 font-bold" />
              </div>
            </div>

            {/* SECURITY SECTION WITH CAPTCHA */}
            <div className="mt-12 pt-12 border-t border-slate-100 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">New_Security_Key</Label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isGoogleUser}
                    placeholder={isGoogleUser ? "OAuth Managed" : "Enter New Password"}
                    className="h-16 rounded-none border-2 border-slate-100 bg-slate-50 focus:border-slate-900"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verification_Captcha</Label>
                  <div className="flex gap-2">
                    {/* Captcha Display */}
                    <div className="h-16 flex-1 bg-slate-900 flex items-center justify-center select-none">
                      <span className="text-white font-black italic tracking-[0.4em] text-lg skew-x-12 line-through decoration-indigo-500">
                        {captchaCode}
                      </span>
                    </div>
                    {/* Refresh Button */}
                    <Button onClick={generateCaptcha} type="button" variant="outline" className="h-16 w-16 border-2 border-slate-900 rounded-none">
                      <RefreshCw size={20} />
                    </Button>
                  </div>
                  {/* Captcha Input */}
                  <Input 
                    placeholder="Type code above"
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                    className="h-12 rounded-none border-2 border-slate-900 bg-white font-black tracking-widest text-center"
                  />
                </div>
              </div>

              <Button 
                disabled={isGoogleUser || !password || userCaptchaInput !== captchaCode || passwordSaving} 
                onClick={handlePasswordChange}
                className="h-16 w-full rounded-none bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-20"
              >
                {passwordSaving ? <Loader2 className="animate-spin" /> : 'Update_Security_Protocol'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}