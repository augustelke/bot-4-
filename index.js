const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

// ===== DATABASE =====
function loadDB() {
    if (!fs.existsSync("./database.json")) {
        fs.writeFileSync("./database.json", JSON.stringify({ reports: [] }, null, 4));
    }
    return JSON.parse(fs.readFileSync("./database.json"));
}

function saveDB(data) {
    fs.writeFileSync("./database.json", JSON.stringify(data, null, 4));
}

// ===== READY =====
client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands.map(c => c.data.toJSON()) }
    );
});

// ===== INTERACTIONS =====
client.on("interactionCreate", async (interaction) => {

    // ===== SLASH =====
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.execute(interaction, client, loadDB, saveDB);
        } catch (e) {
            console.error(e);
            interaction.reply({ content: "Erreur commande", ephemeral: true });
        }
    }

    // ===== BUTTON DELETE SIGNAL =====
    if (interaction.isButton()) {

        if (interaction.customId.startsWith("delete_reports_")) {

            const db = loadDB();

            db.reports = db.reports.filter(r => r.userId !== interaction.user.id);
            saveDB(db);

            return interaction.update({
                content: "Signalements supprimés.",
                embeds: [],
                components: []
            });
        }
    }
});

client.login(process.env.TOKEN);
