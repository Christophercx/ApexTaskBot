import express from "express";
import { Telegraf } from "telegraf";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// ---- ENV VARS ----
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_ID = process.env.ADMIN_ID;
const WEBAPP_URL = process.env.WEBAPP_URL;

// ---- TELEGRAM BOT ----
const bot = new Telegraf(BOT_TOKEN);

// connect MongoDB
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => console.error("❌ MongoDB error", err));

// example schema
const userSchema = new mongoose.Schema({
  telegramId: String,
  apxBalance: { type: Number, default: 0 },
  lastCheckIn: { type: Date, default: null }
});
const User = mongoose.model("User", userSchema);

// bot start command
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({ telegramId });
  }
  ctx.reply("👋 Welcome to ApexTaskBot!\n\nOpen the mini app below to start 👇", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Open Apex Mini App", web_app: { url: WEBAPP_URL } }]
      ]
    }
  });
});

// launch bot
bot.launch().then(() => console.log("🤖 Bot running"));

// express endpoint (for webapp API)
app.get("/", (req, res) => {
  res.send("Apex Mini App Backend is live 🚀");
});

// start express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Server running on ${PORT}`));
