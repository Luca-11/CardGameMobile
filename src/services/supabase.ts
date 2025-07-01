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
      .from("card_packs")
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
    const { data, error } = await supabase.from("user_packs").insert([
      {
        user_id: userId,
        pack_id: packId,
      },
    ]).select(`
        *,
        pack:card_packs(*)
      `);

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          (
            await supabase.auth.getSession()
          ).data.session?.access_token
        }`,
      },
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
    const { data, error } = await supabase
      .from("user_balances")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return { data: data?.balance || 0, error: null };
  } catch (error) {
    console.error("Error getting user balance:", error);
    return { data: 0, error };
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
  packId: string
): Promise<BuyPackResponse> => {
  try {
    console.log("🔵 Service - Début de buyPack", { userId, packId });

    const { data, error } = await supabase.rpc("buy_pack", {
      p_user_id: userId,
      p_pack_id: packId,
    });

    console.log("🔵 Service - Réponse de buy_pack:", { data, error });

    if (error) {
      console.error("🔴 Service - Erreur RPC:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("🔴 Service - Pas de données reçues");
      throw new Error("Aucune donnée reçue de buy_pack");
    }

    const result = data[0];
    if (!result.success) {
      console.error("🔴 Service - Échec de l'achat:", result.message);
      return {
        success: false,
        message: result.message || "Erreur lors de l'achat",
        purchase_id: null,
        new_balance: result.new_balance,
      };
    }

    console.log("🟢 Service - Achat réussi:", result);
    return {
      success: true,
      message: "Achat réussi",
      purchase_id: result.purchase_id,
      new_balance: result.new_balance,
    };
  } catch (error) {
    console.error("🔴 Service - Erreur buyPack:", error);
    throw error;
  }
};
