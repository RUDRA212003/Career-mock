'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Camera, Save, Loader2, Lock 
} from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterProfile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    picture: null
  });

  const [originalData, setOriginalData] = useState({});
  const [password, setPassword] = useState("");

  // Detect Google login
  let provider = null;
  if (typeof window !== 'undefined') {
    try {
      provider = JSON.parse(
        localStorage.getItem('sb-oqaqnjpovruuqpuohjbp-auth-token')
      )?.user?.app_metadata?.provider;
    } catch {}
  }
  const isGoogleUser = provider === 'google';

  useEffect(() => {
    if (user) loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      let userData = {
        fullname: user?.name || user?.email?.split('@')[0] || '',
        email: user?.email,
        picture: user?.picture || null
      };

      // Fetch from DB
      if (user.email) {
        const { data } = await supabase
          .from("users")
          .select("name, email, picture")
          .eq("email", user.email)
          .single();

        if (data) {
          userData = {
            ...userData,
            fullname: data.name ?? userData.fullname,
            picture: data.picture ?? userData.picture
          };
        }
      }

      setProfileData(userData);
      setOriginalData(userData);

    } catch {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be < 5MB");
      return;
    }

    try {
      setSaving(true);

      const filename = `profile-${user.email}-${Date.now()}`;
      await supabase.storage
        .from("profile photo")
        .upload(filename, file);

      const { data: urlData } = supabase.storage
        .from("profile photo")
        .getPublicUrl(filename);

      const imgURL = urlData.publicUrl;

      setProfileData((prev) => ({
        ...prev,
        picture: imgURL,
      }));

      await supabase.from("users").upsert(
        {
          email: user.email,
          name: profileData.fullname,
          picture: imgURL,
        },
        { onConflict: "email" }
      );

      setOriginalData((prev) => ({ ...prev, picture: imgURL }));
      toast.success("Profile picture updated!");

    } catch {
      toast.error("Failed to update picture");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.from("users").upsert(
        {
          email: user.email,
          name: profileData.fullname,
          picture: profileData.picture,
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      setOriginalData(profileData);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password) return;
    setPasswordSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        toast.success("Password updated!");
        setPassword("");
      } else toast.error("Password update failed");
    } finally {
      setPasswordSaving(false);
    }
  };

  const hasChanges = () =>
    JSON.stringify(profileData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
          Profile Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Update your personal information and security settings
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* Picture */}
        <Card className="rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-gray-800">
              <Camera className="w-5 h-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <Avatar className="w-28 h-28 rounded-2xl shadow-md mx-auto border border-gray-200">
              <AvatarImage src={profileData.picture} />
              <AvatarFallback>
                {profileData.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <label htmlFor="pic" className="cursor-pointer">
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" /> Change Picture
              </Button>
            </label>

            <input
              id="pic"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureUpload}
            />

            {saving && (
              <p className="text-sm text-gray-500 flex justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-gray-800">
              <User className="w-5 h-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            <div>
              <Label>Full Name</Label>
              <Input
                value={profileData.fullname}
                placeholder="Enter your name"
                onChange={(e) =>
                  setProfileData({ ...profileData, fullname: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={profileData.email} disabled className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!hasChanges() || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-gray-800">
              <Lock className="w-5 h-5" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                disabled={isGoogleUser}
                value={
                  isGoogleUser
                    ? "Google login users cannot change password"
                    : password
                }
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              {isGoogleUser && (
                <p className="text-xs text-gray-500 mt-1">
                  You logged in using Google OAuth
                </p>
              )}
            </div>

            <Button
              className="w-full"
              disabled={isGoogleUser || !password || passwordSaving}
              onClick={handlePasswordChange}
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-gray-800">
              <Mail className="w-5 h-5" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">

            <div>
              <Label className="text-gray-500">Account Type</Label>
              <p className="font-medium text-gray-800">Recruiter</p>
            </div>

            <div>
              <Label className="text-gray-500">Member Since</Label>
              <p className="font-medium text-gray-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
