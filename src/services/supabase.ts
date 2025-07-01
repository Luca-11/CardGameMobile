import { Database } from "../types/database";
import { BuyPackResponse } from "../types/database";
import { supabase } from "../lib/supabase";

// Helper pour obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      return { ...user, ...userData };
    }

    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Helper pour l'authentification
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { data: null, error };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (authError) throw authError;

    if (authData.user) {
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          username,
          email,
        },
      ]);
      if (userError) throw userError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error };
  }
};

// Helper pour les opérations sur les cartes
export const getUserCards = async (userId: string) => {
  try {
    console.log("🔵 Service - Début de getUserCards", { userId });

    const { data, error } = await supabase
      .from("user_cards")
      .select("*, card:cards(*)")
      .eq("user_id", userId);

    if (error) {
      console.error("🔴 Service - Erreur getUserCards:", error);
      throw error;
    }

    console.log("🟢 Service - Cartes récupérées:", {
      count: data?.length || 0,
    });
    return { data, error: null };
  } catch (error) {
    console.error("🔴 Service - Exception getUserCards:", error);
    return { data: null, error };
  }
};

export const getAvailablePacks = async () => {
  try {
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting available packs:", error);
    return { data: null, error };
  }
};

export const purchasePack = async (userId: string, packId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_packs")
      .insert([
        {
          user_id: userId,
          pack_id: packId,
        },
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error purchasing pack:", error);
    return { data: null, error };
  }
};

export const openPack = async (userPackId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("open-pack", {
      body: { userPackId },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error opening pack:", error);
    return { data: null, error };
  }
};

// Helper pour les récompenses journalières
export const claimDailyReward = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "claim-daily-reward",
      {
        body: { userId },
      }
    );

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return { data: null, error };
  }
};

export const getUserBalance = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc("get_user_balance", {
      p_user_id: userId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting user balance:", error);
    return { data: null, error };
  }
};

export const addCoins = async (userId: string, amount: number) => {
  try {
    const { data, error } = await supabase.rpc("add_coins", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error adding coins:", error);
    return { data: null, error };
  }
};

export const buyPack = async (
  userId: string,
  packId: string,
  quantity: number = 1
): Promise<{ data: BuyPackResponse | null; error: Error | null }> => {
  try {
    console.log("🔵 Service - Début de buyPack", { userId, packId, quantity });

    const { data, error } = await supabase.rpc("buy_pack", {
      p_user_id: userId,
      p_pack_id: packId,
      p_quantity: quantity,
    });

    console.log("🔵 Service - Réponse brute de buy_pack:", { data, error });

    if (error) throw error;

    const response: BuyPackResponse = {
      success: data.success,
      message: data.message,
      purchase_id: data.purchase_id,
      new_balance: data.new_balance,
    };

    console.log("🟢 Service - Réponse formatée:", response);
    return { data: response, error: null };
  } catch (error) {
    console.error("Error buying pack:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};
