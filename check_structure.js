const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xvrscrgtcskpobuvsfkz.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY; // Clé anon ou service_role

async function checkStructure() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔍 Vérification détaillée des tables:\n");

  // Liste des tables à vérifier
  const tables = [
    "cards",
    "user_cards",
    "decks",
    "deck_cards",
    "card_packs",
    "pack_purchases",
  ];

  for (const table of tables) {
    console.log(`\n📦 Table ${table}:`);
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log("Erreur:", error);
      } else {
        console.log("Colonnes:", Object.keys(data[0] || {}).join(", "));
        console.log("Exemple:", JSON.stringify(data[0], null, 2));
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        console.log("Nombre total d'enregistrements:", count);
      }
    } catch (error) {
      console.log("Erreur:", error);
    }
  }

  // Vérification des types énumérés
  console.log("\n🔤 Types énumérés:");
  const { data: types, error: typesError } = await supabase
    .rpc("get_enum_types")
    .select("*");

  if (typesError) {
    console.log("Erreur lors de la vérification des types:", typesError);
  } else {
    console.log("Types trouvés:", types);
  }
}

checkStructure();
