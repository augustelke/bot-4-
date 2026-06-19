const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

// load commands
for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: commands.map(c => c.data.toJSON())
            }
        );

        console.log("Slash commands enregistrées");
    } catch (err) {
        console.error(err);
    }
});

client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: "Erreur commande.",
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
