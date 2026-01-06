'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, Mail, Camera, Save, Loader2, ShieldCheck, 
  LogOut, RefreshCw, KeyRound, CheckCircle2, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfile() {
  const { user, signOut } = useUser();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({ fullname: '', email: '', picture: null });
  const [originalData, setOriginalData] = useState({});
  
  // Password & CAPTCHA States
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Constants based on your system requirements
  const BUCKET_NAME = "profile photo"; 

  const provider = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('sb-oqaqnjpovruuqpuohjbp-auth-token'))?.user?.app_metadata?.provider 
    : null;
  const isGoogleUser = provider === 'google';

  useEffect(() => { 
    if (user) loadProfileData(); 
    generateCaptcha();
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
        const { data: userRecord, error } = await supabase
          .from('users')
          .select('name, email, picture')
          .eq('email', user.email)
          .single();
          
        if (!error && userRecord) {
          userData = { 
            ...userData, 
            fullname: userRecord.name || userData.fullname, 
            picture: userRecord.picture || userData.picture 
          };
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

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserCaptchaInput("");
  };

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // Validation
      if (!file.type.startsWith('image/')) return toast.error("Please upload an image file");
      if (file.size > 2 * 1024 * 1024) return toast.error("File size must be under 2MB");

      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${user.email}-${Date.now()}.${fileExt}`;

      // Upload to your specific "profile photo" bucket
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      setProfileData(prev => ({ ...prev, picture: publicUrl }));
      toast.success('Image uploaded. Don\'t forget to Save Changes!');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
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
      toast.success("Security key updated");
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
      const { error } = await supabase
        .from('users')
        .upsert({ 
          email: user.email, 
          name: profileData.fullname, 
          picture: profileData.picture 
        }, { onConflict: 'email' });
      
      if (error) throw error;
      setOriginalData(profileData);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => JSON.stringify(profileData) !== JSON.stringify(originalData);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Candidate Profile
              {isGoogleUser && <BadgeCheck className="w-5 h-5 text-blue-500" />}
            </h1>
            <p className="text-slate-500 text-sm">Update your public identity and account security</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button onClick={signOut} variant="ghost" className="flex-1 md:flex-none text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
            <Button 
              disabled={!hasChanges() || saving} 
              onClick={handleSave} 
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PHOTO CARD */}
          <Card className="lg:col-span-1 shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-base font-semibold">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-8 pb-8">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-white shadow-lg ring-1 ring-slate-100">
                  <AvatarImage src={profileData.picture} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-5xl font-bold">
                    {profileData.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 bg-blue-600 p-3 rounded-xl text-white shadow-xl hover:bg-blue-700 transition-transform active:scale-95 disabled:bg-slate-300"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="mt-6 text-[11px] text-slate-400 text-center uppercase tracking-widest font-bold">
                Resolution: Min 400x400 <br/> Max Size: 2MB
              </p>
            </CardContent>
          </Card>

          {/* DETAILS & SECURITY COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PERSONAL DETAILS */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Full Name</Label>
                  <Input 
                    id="name"
                    value={profileData.fullname} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))} 
                    className="bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2 opacity-70">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email (Locked)</Label>
                  <div className="relative">
                    <Input 
                      id="email"
                      value={profileData.email} 
                      disabled 
                      className="bg-slate-100 pl-10 cursor-not-allowed" 
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECURITY SECTION */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Account Security
                </CardTitle>
                <CardDescription className="text-xs">
                  {isGoogleUser ? "Account authenticated via Google." : "Update your password below."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">New Password</Label>
                    <div className="relative">
                      <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isGoogleUser}
                        placeholder={isGoogleUser ? "OAuth Protected" : "••••••••"}
                        className="pl-10"
                      />
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Human Verification</Label>
                    <div className="flex gap-2">
                      <div className="h-10 flex-1 bg-slate-900 rounded-lg flex items-center justify-center font-mono font-bold tracking-[0.3em] text-white text-sm select-none border border-slate-800 shadow-inner">
                        {captchaCode}
                      </div>
                      <Button onClick={generateCaptcha} variant="outline" size="icon" className="h-10 w-10 shrink-0">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input 
                      placeholder="Enter CAPTCHA"
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                      className="mt-2 text-center font-bold tracking-widest bg-slate-50/50"
                    />
                  </div>
                </div>

                <Button 
                  disabled={isGoogleUser || !password || userCaptchaInput !== captchaCode || passwordSaving} 
                  onClick={handlePasswordChange}
                  className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 transition-all active:scale-[0.98]"
                >
                  {passwordSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Update Security Key
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}