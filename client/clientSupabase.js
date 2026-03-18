<<<<<<< HEAD
require("dotenv").config();
=======
require("dotenv").config({ path: "./client/.env" });
>>>>>>> da5d35dc1a329033dc243abb7e06c9a70eecddab
const supabaseClient = require("@supabase/supabase-js");

const supabase = supabaseClient.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
