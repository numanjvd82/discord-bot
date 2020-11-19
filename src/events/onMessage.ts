import { Message } from "discord.js";
import MessageInt from "@Interfaces/MessageInt";
import { prefix as defaultPrefix } from "../../default_config.json";
import extendsMessageToMessageInt from "@Utils/extendsMessageToMessageInt";
import ClientInt from "@Interfaces/ClientInt";

/**
 * Execute when a user sends a message in a channel.
 *
 * @async
 * @function
 * @param { Message } message_discord
 * @param { ClientInt } client
 * @returns { Promise<void> }
 */
async function onMessage(
  message_discord: Message,
  client: ClientInt
): Promise<void> {
  // Create a new message interface using the `MessageInt`.
  const message: MessageInt = extendsMessageToMessageInt(message_discord);

  // Add the bot client to the message.
  message.bot = client;

  // Get the author, current channel, content and current guild from the message.
  const { author, channel, content, guild } = message;

  // Separate the message content by whitespaces.
  message.commandArguments = content.split(" ");

  // Check if the message is sended to a private channel (Direct Message)
  // and send a warning to the current channel.
  if (channel.type === "dm" && author.id !== client.user?.id) {
    message.showTypingAndSendMessage(
      "I am so sorry, but would you please talk to me in a server instead of a private message?\nIf you need a server to join, you are welcome to join my support server: https://discord.gg/PHqDbkg\nOr you can join my owner's server: https://discord.gg/yMBWgETTJu",
      3000
    );

    return;
  }

  // Check if the message is sended in a Discord server.
  if (!guild) {
    return;
  }

  // Get the config for that server
  const serverConfig = await client.getSettings(guild.id, guild.name);

  // Get the heartsListener, levelsListener and usageListener from the listeners list.
  const {
    heartsListener,
    thanksListener,
    levelsListener,
    usageListener,
  } = client.customListeners;

  // Check if the heartsListener and levelsListener exists.
  if (heartsListener && levelsListener) {
    // Execute the hearts listener.
    await heartsListener.run(message, serverConfig);

    // Execute the levels listener.
    await levelsListener.run(message, serverConfig);
  }

  // Get the current Discord server id.
  const server_id = guild.id;

  // Get the default prefix.
  let prefix: string = client.prefix[server_id] || "";

  if (!prefix.length) {
    // Get the custom prefix for the server from the database.
    const prefixSetting = serverConfig.prefix;

    // Check if the server has a custom prefix.
    if (prefixSetting) {
      client.prefix[server_id] = prefixSetting;
    } else {
      client.prefix[server_id] = defaultPrefix;
    }

    prefix = client.prefix[server_id];
  }
  // Check if the content of the message starts with the server prefix.
  if (!content.startsWith(prefix)) {
    if (thanksListener) {
      await thanksListener.run(message, serverConfig);
    }
    return;
  }
  // Get the first argument as the command name.
  message.commandName = message.commandArguments.shift() || prefix;

  // Remove the prefix of the command name.
  message.commandName = message.commandName.slice(prefix.length);

  // Get the command by its name.
  const command = client.commands[message.commandName.toLowerCase()];

  // Check if the command exists.
  if (command) {
    // Log the command usage.
    console.log(
      `${message.author.username} called the ${message.commandName} command in ${message.guild?.name}.`
    );

    // Simulate typing
    channel.startTyping();

    // check for block
    const blockCheck = serverConfig.blocked.includes(author.id);
    if (blockCheck) {
      //log it
      console.log("But they were blocked.");

      // respond to blocked user
      await message.sleep(3000);
      channel.stopTyping();
      await message.channel.send(
        "I am so sorry, but I am not allowed to help you."
      );
      return;
    }

    // Check if the usage listener exists.
    if (usageListener) {
      // Execute the usage listener.
      await usageListener.run(message, serverConfig);
    }

    // Respond to bot owner.
    if (message.author.id === process.env.OWNER_ID) {
      channel.stopTyping();
      await message.channel.send(
        "Sure thing, love! I would be happy to do that for you!"
      );
      channel.startTyping();
    }

    // End typing.
    await message.sleep(3000);
    channel.stopTyping();

    // Execute the command.
    await command.run(message, serverConfig);
    return;
  }
}

export default onMessage;
