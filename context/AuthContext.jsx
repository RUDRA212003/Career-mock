"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(undefined);
  const router = useRouter();

  // 🔹 Initial session
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Fetch user profile
  const fetchUserProfile = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!error) setUserProfile(data);
  };

  // 🔹 SIGN IN
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: userData, error: profileError } = await supabase
        .from("users")
        .select("role, banned")
        .eq("email", email)
        .single();

      if (profileError || !userData) {
        toast.error("Could not fetch user profile.");
        return { success: false, error: "Profile not found." };
      }

      if (userData.banned) {
        await supabase.auth.signOut();
        return {
          success: false,
          error:
            "Your account has been banned. Please contact support for more information.",
        };
      }

      setUserProfile(userData);
      toast.success("Logged in!");

      if (userData.role === "recruiter") {
        window.location.href = "/recruiter/dashboard";
      } else {
        window.location.href = "/candidate/dashboard";
      }

      return { success: true, data };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // 🔹 SIGN UP (Supabase-managed CAPTCHA — do NOT pass captchaToken)
  const signUpNewUser = async (email, password, { name, role }) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

      if (authError || !authData?.user?.id) {
        return {
          success: false,
          error: authError?.message || "Signup failed. Please try again.",
        };
      }

      const { error: insertError } = await supabase.from("users").insert([
        {
          email: email.toLowerCase(),
          name,
          role,
          picture:
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          credits: 3,
          banned: false,
        },
      ]);

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      return { success: true, user: authData.user };
    } catch (err) {
      return { success: false, error: "Unexpected error occurred." };
    }
  };

  // 🔹 SIGN OUT
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign out failed.");
      return;
    }

    setSession(null);
    setUserProfile(null);
    toast.success("Successfully signed out.");
    router.push("/login");
  };

  // 🔹 Loading screen
  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Screen. Please Wait..</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        userProfile,
        signInUser,
        signUpNewUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
