const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// "database" simple en RAM (pas de package)
global.reports = [];

for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(c => c.data.toJSON()) }
        );

        console.log("Slash commands OK");
    } catch (err) {
        console.error(err);
    }
});

client.on("interactionCreate", async (interaction) => {

    // ================= SLASH =================
    if (interaction.isChatInputCommand()) {

        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.execute(interaction, client);
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Erreur commande.",
                ephemeral: true
            });
        }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

        if (interaction.customId === "delete_my_reports") {

            global.reports = global.reports.filter(r => r.userId !== interaction.user.id);

            return interaction.reply({
                content: "Tes signalements ont été supprimés.",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
