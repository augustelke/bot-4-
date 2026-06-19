const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands.map(c => c.data.toJSON()) }
    );

    console.log("Slash commands enregistrées");
});

client.on("interactionCreate", async (interaction) => {

    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "Erreur commande.", ephemeral: true });
        }
    }

    // BUTTONS
    if (interaction.isButton()) {

        // delete signals
        if (interaction.customId === "delete_my_reports") {
            const cmd = client.commands.get("supsignal");
            if (cmd && cmd.deleteReports) {
                cmd.deleteReports(interaction);
            }
        }
    }
});

client.login(process.env.TOKEN);
