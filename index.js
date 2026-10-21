import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFIX = "🍓";
const BOT_NAME = "PHÉNIX GUY";
const CREATOR = "MR KING KAYSEUR THE GLITCH DEV";
const TELEGRAM = "@Mr_king_kayseur";
const CHANNEL_URL = process.env.CHANNEL_URL || "https://whatsapp.com/channel/0029Vb8cfQn8V0te5K0atc1s";
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, "auth_info");
const MENU_SVG = path.join(__dirname, "assets", "menu.svg");
const PREFIX_LIST = [
  ["menu", "Afficher le menu illustré"],
  ["help", "Aide et exemples"],
  ["ping", "Tester la latence"],
  ["alive", "État du bot"],
  ["info", "Informations du bot"],
  ["owner", "Informations du créateur"],
  ["channel", "Lien de la chaîne"],
  ["prefix", "Afficher le préfixe"],
  ["time", "Heure actuelle"],
  ["date", "Date du jour"],
  ["say", "Répéter un texte"],
  ["echo", "Répéter un texte"],
  ["quote", "Créer une citation"],
  ["reverse", "Inverser un texte"],
  ["upper", "Texte en majuscules"],
  ["lower", "Texte en minuscules"],
  ["title", "Mettre les mots en majuscules"],
  ["length", "Compter les caractères"],
  ["wordcount", "Compter les mots"],
  ["linecount", "Compter les lignes"],
  ["bold", "Texte gras Unicode"],
  ["italic", "Texte italique Unicode"],
  ["mono", "Texte monospace Unicode"],
  ["frame", "Encadrer un texte"],
  ["unframe", "Retirer un encadrement simple"],
  ["small", "Texte décoratif"],
  ["bubble", "Entourer les lettres"],
  ["clap", "Applaudissements entre les mots"],
  ["emojify", "Décorer un texte"],
  ["trim", "Nettoyer les espaces"],
  ["choose", "Choisir parmi des options séparées par |"],
  ["roll", "Lancer un dé"],
  ["coin", "Pile ou face"],
  ["8ball", "Réponse aléatoire"],
  ["number", "Nombre aléatoire"],
  ["rps", "Pierre-papier-ciseaux"],
  ["joke", "Blague légère"],
  ["fact", "Fait amusant"],
  ["compliment", "Compliment amical"],
  ["motivate", "Message motivant"],
  ["riddle", "Énigme"],
  ["riddle2", "Autre énigme"],
  ["quiz", "Question quiz"],
  ["daily", "Message du jour"],
  ["fortune", "Fortune humoristique"],
  ["truth", "Question vérité légère"],
  ["dare", "Défi amusant sans danger"],
  ["wyr", "Tu préfères"],
  ["rate", "Note humoristique"],
  ["ship", "Score d'amitié aléatoire"],
  ["calc", "Calculatrice simple"],
  ["uuid", "Créer un identifiant"],
  ["password", "Générer un mot de passe local"],
  ["base64", "Encoder en Base64"],
  ["unbase64", "Décoder Base64"],
  ["binary", "Texte en binaire"],
  ["unbinary", "Binaire en texte"],
  ["hex", "Texte en hexadécimal"],
  ["unhex", "Hexadécimal en texte"],
  ["urlencode", "Encoder une URL"],
  ["urldecode", "Décoder une URL"],
  ["charcount", "Compter les caractères"],
  ["dedupe", "Retirer les doublons"],
  ["sort", "Trier les éléments séparés par |"],
  ["shuffle", "Mélanger les éléments séparés par |"],
  ["repeat", "Répéter un texte"],
  ["timestamp", "Afficher le timestamp"],
  ["randomcolor", "Créer une couleur hexadécimale"],
  ["emoji", "Afficher des emojis"],
  ["symbols", "Symboles décoratifs"],
  ["groupinfo", "Informations du groupe"],
  ["admins", "Lister les admins"],
  ["members", "Nombre de membres"],
  ["rules", "Afficher les règles"],
  ["tagall", "Mentionner les membres"],
  ["hidetag", "Message avec mentions"],
  ["linkgroup", "Lien d'invitation"],
  ["revoke", "Réinitialiser le lien"],
  ["groupopen", "Ouvrir le groupe"],
  ["groupclose", "Fermer le groupe"],
  ["kick", "Retirer un membre ciblé"],
  ["add", "Ajouter un numéro"],
  ["promote", "Promouvoir un admin"],
  ["demote", "Retirer le statut admin"],
  ["mute", "Fermer le groupe aux membres"],
  ["unmute", "Rouvrir le groupe"],
  ["setsubject", "Modifier le nom du groupe"],
  ["setdesc", "Modifier la description"],
  ["tagadmins", "Mentionner les admins"],
  ["myrole", "Afficher ton rôle"],
  ["antilink", "Afficher l'état anti-lien"],
  ["antispam", "Conseils anti-spam"],
  ["welcome", "Modèle de bienvenue"],
  ["goodbye", "Modèle de départ"],
  ["warn", "Avertissement textuel"],
  ["poll", "Créer un sondage textuel"],
  ["pollgroup", "Créer un sondage textuel"],
  ["grouphelp", "Aide de modération"],
  ["admincommands", "Lister les commandes admin"],
  ["jid", "Afficher l'identifiant du chat"],
  ["id", "Afficher l'identifiant du chat"],
  ["sticker", "Créer un sticker depuis une image citée"],
  ["toimg", "Convertir un sticker en image"],
  ["mediahelp", "Aide médias"],
  ["caption", "Créer une légende"],
  ["hashtag", "Suggestions de hashtags"],
  ["status", "Idée de statut"],
  ["storyidea", "Idée de story"],
  ["bio", "Créer une bio stylée"],
  ["nickname", "Suggérer un surnom"],
  ["profile", "Créer une fiche textuelle"],
  ["announce", "Préparer une annonce"],
  ["rulesText", "Modèle de règles"],
  ["welcomeText", "Texte de bienvenue"],
  ["goodbyeText", "Texte d'au revoir"],
  ["groupnamehelp", "Aide nom de groupe"],
  ["groupdescHelp", "Aide description de groupe"],
  ["privacy", "Conseils de confidentialité"],
  ["safety", "Conseils de sécurité"],
  ["backup", "Conseils de sauvegarde"],
  ["github", "Lien du dépôt GitHub"],
  ["version", "Version du bot"],
  ["creator", "Nom du créateur"],
  ["credits", "Crédits"],
  ["feedback", "Préparer un retour"],
  ["report", "Préparer un signalement"],
  ["bug", "Aide pour signaler un bug"],
  ["support", "Aide et support"],
  ["language", "Langues prises en charge"],
  ["terms", "Règles d'utilisation"],
  ["about", "À propos du bot"],
  ["restarthelp", "Aide au redémarrage"],
  ["list1", "Liste d'exemples 1"],
  ["list2", "Liste d'exemples 2"],
  ["list3", "Liste d'exemples 3"],
  ["list4", "Liste d'exemples 4"],
  ["list5", "Liste d'exemples 5"],
  ["dateformat", "Date au format long"],
  ["mathhelp", "Aide calculatrice"],
  ["texthelp", "Aide des commandes de texte"],
  ["clearhelp", "Conseils pour effacer manuellement"],
  ["translatehelp", "Aide traduction"],
  ["weatherhelp", "Aide météo"],
  ["wikihelp", "Aide encyclopédie"],
  ["qrhelp", "Aide QR code"],
  ["note", "Créer une note textuelle"],
  ["todo", "Créer une liste de tâches"],
  ["decor", "Décorer un texte"],
  ["claptext", "Décorer un texte avec applaudissements"],
  ["allcommands", "Afficher la liste des commandes"]
    ["purge", "Retirer tout les membres du groupes"]
      ["semi purge", "Retirer la matier des membres du groupe"]
];
const commands = new Map(PREFIX_LIST);
const groupOnly = new Set(["groupinfo","admins","members","rules","tagall","hidetag","linkgroup","revoke","groupopen","groupclose","kick","purge","semi purge","add","promote","demote","mute","unmute","setsubject","setdesc","tagadmins","myrole","jid","id"]);
const adminOnly = new Set(["revoke","groupopen","groupclose","kick","purge","add","promote","demote","mute","unmute","setsubject","setdesc"]);
const fun = a => a[Math.floor(Math.random() * a.length)];
const digits = s => String(s || "").replace(/\D/g, "");
const isGroup = jid => String(jid || "").endsWith("@g.us");
const getText = msg => {
  const m = msg.message || {};
  return m.conversation || m.extendedTextMessage?.text ||
    m.imageMessage?.caption || m.videoMessage?.caption ||
    m.documentMessage?.caption || m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId || "";
};
const getContext = msg => msg.message?.extendedTextMessage?.contextInfo ||
  msg.message?.imageMessage?.contextInfo || msg.message?.videoMessage?.contextInfo || {};
const getTarget = (msg, args) => {
  const ctx = getContext(msg);
  const mention = ctx.mentionedJid?.[0];
  if (mention) return mention;
  if (ctx.participant) return ctx.participant;
  const num = digits(args[0]);
  return num ? `${num}@s.whatsapp.net` : null;
};
const frame = s => `╭━━〔 🍓 PHÉNIX GUY 〕━━╮\n┃ ${s}\n╰━━━━━━━━━━━━━━━━━━╯`;
const menuText = () => {
  const sections = [
    ["👑 GÉNÉRAL", ["menu","help","ping","alive","info","owner","channel","prefix","time","date","version","creator","about"]],
    ["✍️ TEXTE", ["say","echo","quote","reverse","upper","lower","title","length","wordcount","linecount","bold","italic","mono","frame","unframe","small","bubble","clap","emojify","trim"]],
    ["🧰 OUTILS", ["calc","uuid","password","base64","unbase64","binary","unbinary","hex","unhex","urlencode","urldecode","charcount","dedupe","sort","shuffle","repeat","timestamp","randomcolor"]],
    ["🎮 FUN", ["choose","roll","coin","8ball","number","rps","joke","fact","compliment","motivate","riddle","riddle2","quiz","daily","fortune","truth","dare","wyr","rate","ship"]],
    ["👥 GROUPE", ["groupinfo","admins","members","rules","tagall","hidetag","linkgroup","revoke","groupopen","groupclose","kick","purge","semi purge","add","promote","demote","mute","unmute","setsubject","setdesc","tagadmins","myrole","antilink","antispam","welcome","goodbye","warn","grouphelp"]],
    ["🖼️ MÉDIAS & PROFIL", ["sticker","toimg","mediahelp","caption","hashtag","status","storyidea","bio","nickname","profile","announce","rulesText","welcomeText","goodbyeText"]],
    ["🛟 AIDE", ["privacy","safety","backup","github","credits","feedback","report","bug","support","language","terms","restarthelp","list1","list2","list3","list4","list5","dateformat","mathhelp","texthelp","clearhelp","translatehelp","weatherhelp","wikihelp","qrhelp","note","todo","decor","allcommands"]]
  ];
  let out = `╭━━━━━━━━〔 🍓 *${BOT_NAME}* 〕━━━━━━━━╮\n┃ 👑 *ᴄʀéᴀᴛᴇᴜʀ :* ${CREATOR}\n┃ *✈️ ᴛᴇʟᴇɢʀᴀᴍ :* ${TELEGRAM}\n┃ *⚙️ ᴘʀᴇғɪxᴇ :* ${PREFIX}\n┃ *📚 ʀᴇɢɪsᴛʀᴇ : ${commands.size} ᴄᴏᴍᴍᴀᴍᴅs*\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
  for (const [title, names] of sections) {
    out += `╭─『 ${title} 』\n`;
    out += names.filter(n => commands.has(n)).map(n => `│ ${PREFIX}${n}`).join("\n");
    out += "\n╰────────────────────\n\n";
  }
  out += `📤 *PARTAGER* : partage ce message avec tes amis\n📣 *VOIR LA CHAÎNE* : ${CHANNEL_URL}\n\n© ${BOT_NAME} • ${CREATOR}`;
  return out;
};
const sendText = (sock, jid, text, msg) =>
  sock.sendMessage(jid, { text }, msg ? { quoted: msg } : {});
const getMenuImage = async () => {
  if (!fs.existsSync(MENU_SVG)) throw new Error("Image intégrée introuvable: assets/menu.svg");
  return sharp(MENU_SVG).jpeg({ quality: 88 }).toBuffer();
};
const toUnicode = (text, upperStart, lowerStart) => [...text].map(c => {
  const n = c.codePointAt(0);
  if (n >= 65 && n <= 90) return String.fromCodePoint(upperStart + n - 65);
  if (n >= 97 && n <= 122) return String.fromCodePoint(lowerStart + n - 97);
  return c;
}).join("");
const safeCalc = expr => {
  if (!/^[\d\s()+\-*/%.]+$/.test(expr) || !expr.trim()) return null;
  try {
    // Small arithmetic parser without eval.
    const tokens = expr.match(/\d+(?:\.\d+)?|[()+\-*/%]/g) || [];
    if (tokens.join("") !== expr.replace(/\s/g, "")) return null;
    let i = 0;
    function atom() {
      const t = tokens[i++];
      if (t === "+") return atom();
      if (t === "-") return -atom();
      if (t === "(") { const v = sum(); if (tokens[i++] !== ")") throw Error(); return v; }
      if (!t || !/^\d/.test(t)) throw Error();
      return Number(t);
    }
    function product() {
      let v = atom();
      while (["*","/","%"].includes(tokens[i])) {
        const op = tokens[i++], b = atom();
        if ((op === "/" || op === "%") && b === 0) throw Error();
        v = op === "*" ? v*b : op === "/" ? v/b : v%b;
      }
      return v;
    }
    function sum() {
      let v = product();
      while (tokens[i] === "+" || tokens[i] === "-") {
        const op = tokens[i++], b = product();
        v = op === "+" ? v+b : v-b;
      }
      return v;
    }
    const result = sum();
    if (i !== tokens.length || !Number.isFinite(result)) return null;
    return result;
  } catch { return null; }
};
async function handleCommand(sock, msg, chatId, sender, body, isOwner, isAdmin, botIsAdmin) {
  const parts = body.trim().split(/\s+/);
  const command = parts[0].slice(PREFIX.length).toLowerCase();
  const args = parts.slice(1);
  const text = args.join(" ");
  if (!commands.has(command)) return;
  if (groupOnly.has(command) && !isGroup(chatId)) return sendText(sock, chatId, "*⚠️ Cette commande fonctionne seulement dans un groupe.*", msg);
  if (adminOnly.has(command) && !(isOwner || isAdmin)) return sendText(sock, chatId, "*⛔ Réservé au propriétaire ou aux admins du groupe.*", msg);
  if (adminOnly.has(command) && !botIsAdmin) return sendText(sock, chatId, "*⚠️ Le bot doit être administrateur du groupe.*", msg);
  if (command === "menu" || command === "help") {
    try { return await sock.sendMessage(chatId, { image: await getMenuImage(), caption: menuText(), contextInfo: { externalAdReply: { title: "*PHÉNIX GUY*", body: "*MR KING KAYSEUR THE GLITCH DEV*", sourceUrl: CHANNEL_URL, mediaType: 1, renderLargerThumbnail: true } } }, { quoted: msg }); }
    catch (e) { console.error("Menu image:", e.message); return sendText(sock, chatId, menuText(), msg); }
  }
  if (command === "allcommands" || command === "admincommands") return sendText(sock, chatId, [...commands].map(([n,d]) => `${PREFIX}${n} — ${d}`).join("\n"), msg);
  if (command === "ping") return sendText(sock, chatId, "🏓 Pong ! PHÉNIX GUY est actif.", msg);
  if (command === "alive") return sendText(sock, chatId, frame(`†✅ En ligne*\n👑 ${CREATOR}`), msg);
  if (command === "info" || command === "about") return sendText(sock, chatId, frame(`Version 2.0.0\nPréfixe : ${PREFIX}\nCommandes au registre : ${commands.size}\nPropriétaire : ${OWNER_NUMBER || "non configuré"}`), msg);
  if (command === "owner" || command === "creator" || command === "credits") return sendText(sock, chatId, `👑 ${CREATOR}\n✈️ Telegram : ${TELEGRAM}\n📣 Chaîne : ${CHANNEL_URL}`, msg);
  if (command === "channel") return sendText(sock, chatId, `📣 Chaîne officielle :\n${CHANNEL_URL}`, msg);
  if (command === "prefix") return sendText(sock, chatId, `Préfixe : ${PREFIX}`, msg);
  if (command === "time") return sendText(sock, chatId, `🕒 ${new Date().toLocaleTimeString("fr-FR")}`, msg);
  if (command === "date" || command === "dateformat") return sendText(sock, chatId, `📅 ${new Date().toLocaleDateString("fr-FR", {dateStyle:"full"})}`, msg);
  if (command === "version") return sendText(sock, chatId, "PHÉNIX GUY v2.0.0 • Node.js / Baileys", msg);
  if (command === "github") return sendText(sock, chatId, "📦 https://github.com/kingkayseur-oss/phenix-guy-whatsapp-bot-v1", msg);
  if (command === "say" || command === "echo") return sendText(sock, chatId, text || "Utilisation : 🍓say ton texte", msg);
  if (command === "quote") return sendText(sock, chatId, `💬 « ${text || "Chaque jour est une nouvelle occasion d'avancer."} »`, msg);
  if (command === "reverse") return sendText(sock, chatId, [...text].reverse().join("") || "Utilisation : 🍓reverse ton texte", msg);
  if (command === "upper") return sendText(sock, chatId, text.toUpperCase() || "Utilisation : 🍓upper ton texte", msg);
  if (command === "lower") return sendText(sock, chatId, text.toLowerCase() || "Utilisation : 🍓lower ton texte", msg);
  if (command === "title") return sendText(sock, chatId, text.replace(/\b\p{L}/gu, c => c.toUpperCase()) || "Utilisation : 🍓title ton texte", msg);
  if (["length","charcount"].includes(command)) return sendText(sock, chatId, `🔢 Caractères : ${text.length}`, msg);
  if (command === "wordcount") return sendText(sock, chatId, `🔤 Mots : ${(text.match(/\S+/g)||[]).length}`, msg);
  if (command === "linecount") return sendText(sock, chatId, `📄 Lignes : ${text ? text.split("\n").length : 0}`, msg);
  if (command === "bold") return sendText(sock, chatId, toUnicode(text, 0x1D400, 0x1D41A) || "Utilisation : 🍓bold ton texte", msg);
  if (command === "italic") return sendText(sock, chatId, toUnicode(text, 0x1D434, 0x1D44E) || "Utilisation : 🍓italic ton texte", msg);
  if (command === "mono") return sendText(sock, chatId, toUnicode(text, 0x1D670, 0x1D68A) || "Utilisation : 🍓mono ton texte", msg);
  if (command === "frame") return sendText(sock, chatId, `╭━━〔 🍓 〕━━╮\n┃ ${text || "PHÉNIX GUY"}\n╰━━━━━━━━━━╯`, msg);
  if (command === "unframe" || command === "trim") return sendText(sock, chatId, text.replace(/[╭╮╰╯┃━─〔〕]/g, "").trim(), msg);
  if (command === "small") { const map = {a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"ꜱ",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"}; return sendText(sock, chatId, [...text].map(c => map[c.toLowerCase()] || c).join(""), msg); }
  if (command === "bubble") return sendText(sock, chatId, [...text].map(c => /[a-z]/i.test(c) ? String.fromCodePoint((c.toLowerCase().charCodeAt(0)-97)+0x24D0) : c).join(""), msg);
  if (command === "clap" || command === "claptext") return sendText(sock, chatId, text.split(/\s+/).filter(Boolean).join(" 👏 ") || "Utilisation : 🍓clap ton texte", msg);
  if (command === "emojify" || command === "decor") return sendText(sock, chatId, `✨ ${[...text].join(" ✦ ")} ✨`, msg);
  if (command === "calc" || command === "mathhelp") {
    const result = safeCalc(text);
    return sendText(sock, chatId, result === null ? "Utilisation : 🍓calc (12 + 4) * 2" : `🧮 Résultat : ${result}`, msg);
  }
  if (command === "uuid") return sendText(sock, chatId, crypto.randomUUID(), msg);
  if (command === "password") return sendText(sock, chatId, `🔐 Mot de passe local : ${crypto.randomBytes(9).toString("base64url")}\nNe le partage pas publiquement.`, msg);
  if (command === "base64") return sendText(sock, chatId, Buffer.from(text, "utf8").toString("base64"), msg);
  if (command === "unbase64") { try { return sendText(sock, chatId, Buffer.from(text, "base64").toString("utf8"), msg); } catch { return sendText(sock, chatId, "Texte Base64 invalide.", msg); } }
  if (command === "binary") return sendText(sock, chatId, [...Buffer.from(text)].map(b => b.toString(2).padStart(8,"0")).join(" "), msg);
  if (command === "unbinary") { try { return sendText(sock, chatId, Buffer.from(text.split(/\s+/).map(b => parseInt(b,2))).toString("utf8"), msg); } catch { return sendText(sock, chatId, "Binaire invalide.", msg); } }
  if (command === "hex") return sendText(sock, chatId, Buffer.from(text).toString("hex"), msg);
  if (command === "unhex") { try { return sendText(sock, chatId, Buffer.from(text, "hex").toString("utf8"), msg); } catch { return sendText(sock, chatId, "Hexadécimal invalide.", msg); } }
  if (command === "urlencode") return sendText(sock, chatId, encodeURIComponent(text), msg);
  if (command === "urldecode") { try { return sendText(sock, chatId, decodeURIComponent(text), msg); } catch { return sendText(sock, chatId, "URL encodée invalide.", msg); } }
  if (command === "dedupe") return sendText(sock, chatId, [...new Set(text.split(/\s+/))].join(" "), msg);
  if (command === "sort") return sendText(sock, chatId, text.split("|").map(s=>s.trim()).sort((a,b)=>a.localeCompare(b)).join(" | "), msg);
  if (command === "shuffle") return sendText(sock, chatId, text.split("|").map(s=>s.trim()).sort(()=>Math.random()-.5).join(" | "), msg);
  if (command === "repeat") { const count = Math.max(1, Math.min(10, Number(args[0]) || 2)); return sendText(sock, chatId, Array(count).fill(args.slice(1).join(" ")).join("\n") || "Utilisation : 🍓repeat 3 texte", msg); }
  if (command === "timestamp") return sendText(sock, chatId, `${Date.now()} (${new Date().toISOString()})`, msg);
  if (command === "randomcolor") return sendText(sock, chatId, "#" + crypto.randomBytes(3).toString("hex").toUpperCase(), msg);
  if (command === "choose") { const opts = text.split("|").map(s=>s.trim()).filter(Boolean); return sendText(sock, chatId, opts.length ? `🎯 ${fun(opts)}` : "Utilisation : 🍓choose thé | café | eau", msg); }
  if (command === "roll") return sendText(sock, chatId, `🎲 ${1 + Math.floor(Math.random()*6)}`, msg);
  if (command === "coin") return sendText(sock, chatId, fun(["🪙 Pile","🪙 Face"]), msg);
  if (command === "8ball") return sendText(sock, chatId, fun(["Oui.","Non.","Probablement.","Réessaie plus tard.","Les signes sont favorables.","Je ne peux pas le prédire."]), msg);
  if (command === "number") return sendText(sock, chatId, `🔢 ${1 + Math.floor(Math.random()*100)}`, msg);
  if (command === "rps") return sendText(sock, chatId, `✊ ${fun(["Pierre","Papier","Ciseaux"])} !`, msg);
  if (command === "joke") return sendText(sock, chatId, fun(["Pourquoi le codeur aime le café ? Parce qu'il débogue mieux éveillé. 😄","Mon ordinateur est très poli : il ferme toujours les fenêtres. 😄","Le bot a pris des vacances : il était saturé de messages. 😄"]), msg);
  if (command === "fact") return sendText(sock, chatId, fun(["Les pieuvres ont trois cœurs.","Les abeilles communiquent notamment par une danse.","Une journée solaire n'a pas exactement 24 heures."]), msg);
  if (command === "compliment") return sendText(sock, chatId, fun(["Tu progresses à ton rythme, continue ! ✨","Ta créativité peut faire la différence. 👑","Une bonne idée devient meilleure quand on la travaille. 🚀"]), msg);
  if (command === "motivate" || command === "daily") return sendText(sock, chatId, fun(["👑 Avance étape par étape : la constance compte.","🔥 Apprends, teste, améliore et recommence.","🚀 Chaque erreur peut t'apprendre quelque chose."]), msg);
  if (command === "riddle" || command === "riddle2") return sendText(sock, chatId, "🧩 Énigme : qu'est-ce qui a des touches mais n'ouvre aucune porte ? Réponse : un clavier.", msg);
  if (command === "quiz") return sendText(sock, chatId, "🧠 Quiz : combien de côtés a un hexagone ? Réponds dans le chat : 6.", msg);
  if (command === "fortune") return sendText(sock, chatId, "🔮 Fortune du jour : une petite étape régulière peut t'aider à avancer.", msg);
  if (command === "truth") return sendText(sock, chatId, "🎤 Vérité : quelle compétence aimerais-tu apprendre cette année ?", msg);
  if (command === "dare") return sendText(sock, chatId, "🎯 Défi sans danger : apprends un nouveau mot et utilise-le aujourd'hui.", msg);
  if (command === "wyr") return sendText(sock, chatId, "🤔 Tu préfères apprendre une nouvelle langue ou maîtriser un instrument ?", msg);
  if (command === "rate" || command === "ship") return sendText(sock, chatId, `✨ Score humoristique : ${Math.floor(Math.random()*101)}% (juste pour rire).`, msg);
  if (command === "emoji") return sendText(sock, chatId, "👑 🍓 🔥 ✨ 🚀 💎 🕷️ 🛡️ 🎮 📣", msg);
  if (command === "symbols") return sendText(sock, chatId, "✦ ✧ ♛ ♕ ⟡ 『 』 ╭ ╮ ╰ ╯ ━ ┃", msg);
  if (command === "cat") return sendText(sock, chatId, "🐈 Miaou !", msg);
  if (command === "dog") return sendText(sock, chatId, "🐕 Wouf !", msg);
  if (command === "heart") return sendText(sock, chatId, "💙 💜 💛 🤍 🖤", msg);
  if (command === "hug") return sendText(sock, chatId, "🫂 Un câlin amical pour toi !", msg);
  if (command === "nickname") return sendText(sock, chatId, `👑 Surnom suggéré : ${fun(["Shadow King","Phénix Royal","Glitch Master","Celestial One"])}`, msg);
  if (command === "bio" || command === "profile") return sendText(sock, chatId, `╭━━〔 ✨ PROFIL 〕━━╮\n┃ Nom : ${text || "Ton nom"}\n┃ Style : Royal • Créatif\n╰━━━━━━━━━━━━━━━━╯`, msg);
  if (command === "caption" || command === "status" || command === "storyidea") return sendText(sock, chatId, `✨ ${text || "Reste concentré sur tes objectifs. Le meilleur se construit avec le temps."}`, msg);
  if (command === "hashtag") return sendText(sock, chatId, "#PhenixGuy #KingKayseur #WhatsAppBot #GlitchDev", msg);
  if (command === "poll" || command === "pollgroup") return sendText(sock, chatId, `📊 SONDAGE\n${text || "Quelle est votre option préférée ?"}\nRépondez avec 1️⃣ ou 2️⃣. (Sondage textuel)`, msg);
  if (command === "note" || command === "todo") return sendText(sock, chatId, `📝 À conserver dans ce chat :\n${text || "Ajoute ton texte après la commande."}`, msg);
  if (command === "support" || command === "feedback" || command === "report" || command === "bug") return sendText(sock, chatId, `🛟 Décris le problème et contacte le créateur : ${TELEGRAM}`, msg);
  if (command === "privacy" || command === "safety" || command === "backup" || command === "terms") return sendText(sock, chatId, "🛡️ Conseils : protège tes identifiants, ne partage pas les données de session et utilise le bot avec respect.", msg);
  if (command === "language") return sendText(sock, chatId, "🌐 Langue principale : français. Les commandes textuelles acceptent aussi d'autres langues.", msg);
  if (command === "restarthelp") return sendText(sock, chatId, "⚙️ Dans le panel, arrête puis démarre le serveur. Vérifie les logs si le démarrage échoue.", msg);
  if (command === "clearhelp") return sendText(sock, chatId, "ℹ️ La suppression des anciens messages se fait manuellement dans WhatsApp.", msg);
  if (command === "translatehelp" || command === "weatherhelp" || command === "wikihelp" || command === "qrhelp" || command === "mediahelp" || command === "texthelp") return sendText(sock, chatId, `ℹ️ Cette version affiche une aide pour ${command}; elle n'appelle pas de service externe.`, msg);
  if (command === "antilink" || command === "antispam" || command === "welcome" || command === "goodbye" || command === "warn" || command === "grouphelp" || command === "rules" || command === "rulesText" || command === "welcomeText" || command === "goodbyeText" || command === "groupnamehelp" || command === "groupdescHelp") return sendText(sock, chatId, `ℹ️ ${commands.get(command)}\nCette commande fournit une aide textuelle dans cette version.`, msg);
  if (command === "members" || command === "admins" || command === "groupinfo" || command === "myrole") {
    try {
      const meta = await sock.groupMetadata(chatId);
      if (command === "members") return sendText(sock, chatId, `👥 Membres : ${meta.participants.length}`, msg);
      if (command === "groupinfo") return sendText(sock, chatId, `╭━━〔 👥 GROUPE 〕━━╮\n┃ Nom : ${meta.subject}\n┃ Membres : ${meta.participants.length}\n┃ ID : ${chatId}\n╰━━━━━━━━━━━━━━━━╯`, msg);
      if (command === "admins") return sendText(sock, chatId, meta.participants.filter(p=>p.admin).map(p=>`• @${p.id.split("@")[0]}`).join("\n") || "Aucun admin détecté.", msg);
      return sendText(sock, chatId, meta.participants.find(p=>p.id===sender)?.admin ? "*👑 Tu es admin.*" : "*👤 Tu es membre.*", msg);
    } catch { return sendText(sock, chatId, "Impossible de lire les infos du groupe.", msg); }
  }
  if (command === "linkgroup" || command === "revoke" || command === "groupopen" || command === "groupclose" || command === "kick" || command === "add" || command === "promote" || command === "demote" || command === "mute" || command === "unmute" || command === "setsubject" || command === "setdesc" || command === "purge") {
    try {
      if (command === "linkgroup") return sendText(sock, chatId, `🔗 https://chat.whatsapp.com/${await sock.groupInviteCode(chatId)}`, msg);
      if (command === "revoke") { await sock.groupRevokeInvite(chatId); return sendText(sock, chatId, "✅ Lien d'invitation renouvelé.", msg); }
      if (["groupopen","unmute"].includes(command)) { await sock.groupSettingUpdate(chatId, "not_announcement"); return sendText(sock, chatId, "✅ Le groupe est ouvert aux membres.", msg); }
      if (["groupclose","mute"].includes(command)) { await sock.groupSettingUpdate(chatId, "announcement"); return sendText(sock, chatId, "🔒 Seuls les admins peuvent écrire.", msg); }
      if (command === "setsubject") { if (!text) return sendText(sock, chatId, "Utilisation : 🍓setsubject nouveau nom", msg); await sock.groupUpdateSubject(chatId, text); return sendText(sock, chatId, "✅ Nom du groupe modifié.", msg); }
      if (command === "setdesc") { if (!text) return sendText(sock, chatId, "Utilisation : 🍓setdesc nouvelle description", msg); await sock.groupUpdateDescription(chatId, text); return sendText(sock, chatId, "✅ Description modifiée.", msg); }
      const target = getTarget(msg, args);
      if (!target) return sendText(sock, chatId, "Réponds au message d'un membre ou indique son numéro international.", msg);
      if (target === sock.user?.id) return sendText(sock, chatId, "Je ne peux pas appliquer cette action à mon propre compte.", msg);
      const action = command === "kick" ? "purge" ? "remove" ? "semi purge" : command === "add" ? "add" : command === "promote" ? "promote" : "demote";
      await sock.groupParticipantsUpdate(chatId, [target], action);
      return sendText(sock, chatId, `✅ Action ${command} effectuée pour @${target.split("@")[0]}.`, msg);
    } catch (e) { return sendText(sock, chatId, `❌ Action impossible : ${e.message || "vérifie les droits admin du bot"}`, msg); }
  }
  if (command === "tagall" || command === "hidetag" || command === "tagadmins") {
    try {
      const meta = await sock.groupMetadata(chatId);
      let targets = meta.participants;
      if (command === "tagadmins") targets = targets.filter(p => p.admin);
      const mentions = targets.map(p => p.id);
      const bodyText = text || (command === "tagall" ? "📢 Attention à tous !" : "*📢 Message du groupe*");
      return sock.sendMessage(chatId, { text: bodyText, mentions }, { quoted: msg });
    } catch { return sendText(sock, chatId, "Impossible de mentionner les membres.", msg); }
  }
  if (command === "jid" || command === "id") return sendText(sock, chatId, `🆔 Chat : ${chatId}\n👤 Expéditeur : ${sender}`, msg);
  if (command === "sticker") {
    const ctx = getContext(msg);
    const quotedMsg = ctx.quotedMessage;
    const imageMessage = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMessage) return sendText(sock, chatId, "Réponds à une image avec 🍓sticker.", msg);
    try {
      const buffer = await downloadMediaMessage(msg.message?.imageMessage ? msg : { key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant }, message: quotedMsg }, "buffer", {}, { logger: pino({level:"silent"}), reuploadRequest: sock.updateMediaMessage });
      const webp = await sharp(buffer).resize(512,512,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).webp().toBuffer();
      return sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
    } catch { return sendText(sock, chatId, "Impossible de créer le sticker avec ce média.", msg); }
  }
  // These registry entries are valid, safe fallbacks instead of fake advanced implementations.
  return sendText(sock, chatId, `ℹ️ *${PREFIX}${command}*\n${commands.get(command)}\n\nCette commande fournit une réponse d'aide dans cette version.`, msg);
}
let connecting = false;
async function startBot() {
  if (connecting) return;
  connecting = true;
  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    let version;
    try { ({ version } = await fetchLatestBaileysVersion()); } catch { version = undefined; }
    const sock = makeWASocket({
      version, auth: state, printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: ["PHENIX GUY", "Chrome", "2.0.0"],
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,
      markOnlineOnConnect: false,
      syncFullHistory: false
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", update => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) { console.log("\nScanne ce QR dans WhatsApp > Appareils connectés :\n"); qrcode.generate(qr, { small: true }); }
      if (connection === "open") { console.log("*✅ PHÉNIX GUY connecté.*"); connecting = false; }
      if (connection === "close") {
        connecting = false;
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log("Connexion fermée. Code:", code ?? "inconnu");
        if (code !== DisconnectReason.loggedOut) setTimeout(() => startBot().catch(console.error), 5000);
        else console.log("Session déconnectée. Supprime auth_info uniquement si tu veux refaire l'association.");
      }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        const chatId = msg.key.remoteJid;
        if (!chatId || chatId === "status@broadcast") continue;
        const body = getText(msg).trim();
        if (!body.startsWith(PREFIX)) continue;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = OWNER_NUMBER && digits(sender.split("@")[0]) === OWNER_NUMBER;
        let isAdmin = false, botIsAdmin = false;
        if (isGroup(chatId)) {
          try {
            const meta = await sock.groupMetadata(chatId);
            isAdmin = Boolean(meta.participants.find(p => p.id === sender)?.admin);
            botIsAdmin = Boolean(meta.participants.find(p => p.id === sock.user?.id)?.admin);
          } catch {}
        }
        try { await handleCommand(sock, msg, chatId, sender, body, Boolean(isOwner), isAdmin, botIsAdmin); }
        catch (e) { console.error("Erreur commande:", e); await sendText(sock, chatId, "❌ Une erreur est survenue. Vérifie les logs du serveur.", msg); }
      }
    });
  } catch (e) {
    connecting = false;
    console.error("Impossible de démarrer PHÉNIX GUY:", e);
    throw e;
  }
}
process.on("uncaughtException", e => console.error("Erreur non interceptée:", e));
process.on("unhandledRejection", e => console.error("Promesse rejetée:", e));
console.log(`🍓 ${BOT_NAME} • ${commands.size} commandes au registre • démarrage...`);
startBot().catch(e => { console.error(e); process.exitCode = 1; });
