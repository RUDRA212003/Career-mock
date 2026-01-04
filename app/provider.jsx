"use client";

import React, { useEffect, useState, useContext, createContext } from "react";
import { supabase } from "@/services/supabaseClient";

// ✅ Create context here (no need for separate UserDetailContext file)
const UserDetailContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    CreateOrFetchUser();
  }, []);

  const CreateOrFetchUser = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      console.warn("No authenticated user found:", authError?.message);
      return;
    }

    const currentUser = authData.user;
    try {
      const { data: Users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUser.email);

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (!Users || Users.length === 0) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              name: currentUser.user_metadata?.name || "New User",
              email: currentUser.email,
              picture: currentUser.user_metadata?.picture || "",
              credits: 3, // ✅ give default credits
            },
          ])
          .select();

        if (insertError) {
          console.error("Error creating user:", insertError.message);
          return;
        }

        setUser(newUser?.[0] || null);
        console.log("✅ User created:", newUser?.[0]);
      } else {
        setUser(Users[0]);
        console.log("✅ Existing user:", Users[0]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // ✅ Add credit update logic
  const updateUserCredits = async (newCredits) => {
    if (!user?.email) return { success: false };

    const { error } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("email", user.email);

    if (error) {
      console.error("Credit update failed:", error);
      return { success: false, error };
    }

    setUser((prev) => ({ ...prev, credits: newCredits }));
    console.log("✅ Credits updated:", newCredits);
    return { success: true };
  };

  return (
    <UserDetailContext.Provider value={{ user, setUser, updateUserCredits }}>
      {children}
    </UserDetailContext.Provider>
  );
}

// ✅ Default export (to match your working import)
export default Provider;

// ✅ Named hook export
export const useUser = () => useContext(UserDetailContext);
