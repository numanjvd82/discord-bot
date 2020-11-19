import { Client, Guild, MessageEmbed, TextChannel } from "discord.js";
import ClientInt from "@Interfaces/ClientInt";
import { sleep } from "./extendsMessageToMessageInt";
import ServerModel, { ServerModelInt } from "@Models/ServerModel";
import { prefix as defaultPrefix } from "../../default_config.json";

/**
 * See `./src/interfaces/ClientInt.ts` for more information.
 *
 * @async
 * @function
 * @param { string } serverID
 * @param {string} serverName
 * @param { string } key
 * @param { string } value
 * @returns { Promise<SettingModelInt> }
 */
async function setSetting(
  serverID: string,
  serverName: string,
  key:
    | "prefix"
    | "thanks"
    | "levels"
    | "welcome_channel"
    | "log_channel"
    | "restricted_role"
    | "moderator_role"
    | "custom_welcome"
    | "hearts"
    | "blocked",
  value: string
): Promise<ServerModelInt> {
  let server = await ServerModel.findOne({
    serverID,
  });

  if (!server) {
    server = await ServerModel.create({
      serverID: serverID,
      serverName: serverName,
      prefix: "|",
      thanks: "off",
      levels: "off",
      welcome_channel: "",
      log_channel: "",
      restricted_role: "",
      moderator_role: "",
      custom_welcome: "",
      hearts: [],
      blocked: [],
    });
  }

  if (key === "hearts") {
    if (server.hearts.includes(value.replace(/\D/g, ""))) {
      const index = server.hearts.indexOf(value.replace(/\D/g, ""));
      server.hearts.splice(index, 1);
      server.markModified("hearts");
    } else {
      server.hearts.push(value.replace(/\D/g, ""));
      server.markModified("hearts");
    }
  } else if (key === "blocked") {
    if (server.blocked.includes(value.replace(/\D/g, ""))) {
      const index = server.blocked.indexOf(value.replace(/\D/g, ""));
      server.blocked.splice(index, 1);
      server.markModified("blocked");
    } else {
      server.blocked.push(value.replace(/\D/g, ""));
      server.markModified("blocked");
    }
  } else if (
    key !== "custom_welcome" &&
    key !== "prefix" &&
    key !== "levels" &&
    key !== "thanks"
  ) {
    server[key] = value.replace(/\D/g, "");
  } else {
    server[key] = value;
  }

  server.serverName = serverName;
  await server.save();

  return server;
}

/**
 * See `./src/interfaces/ClientInt.ts` for more information.
 *
 * @async
 * @function
 * @param { string } serverID
 * @returns { Promise<SettingModelInt> }
 */
async function getSettings(
  serverID: string,
  serverName: string
): Promise<ServerModelInt> {
  let server = await ServerModel.findOne({
    serverID,
  });

  if (!server) {
    server = await ServerModel.create({
      serverID: serverID,
      serverName: serverName,
      prefix: defaultPrefix,
      thanks: "off",
      levels: "off",
      welcome_channel: "",
      log_channel: "",
      restricted_role: "",
      moderator_role: "",
      custom_welcome: "",
      hearts: [],
      blocked: [],
    });
  }

  return server;
}

/**
 * See `./src/interfaces/ClientInt.ts` for more information.
 *
 * @async
 * @function
 * @param { ClientInt } this
 * @param { Guild } guild
 * @param { string | MessageEmbed } message
 * @returns { Promise<void> }
 */
async function sendMessageToLogsChannel(
  this: ClientInt,
  guild: Guild,
  message: string | MessageEmbed
): Promise<void> {
  // Get the logs channel from the database.
  const logsChannelSetting = (await this.getSettings(guild.id, guild.name))
    .log_channel;

  // Check if the channel exists.
  if (!logsChannelSetting) {
    return;
  }

  const logsChannel = await guild.channels.cache.find(
    (chan) => chan.id === logsChannelSetting && chan.type === "text"
  );

  if (!logsChannel) {
    return;
  }

  // Start typing.
  (logsChannel as TextChannel).startTyping();

  // Sleep 3 seconds.
  await sleep(3000);

  // Stop typing.
  (logsChannel as TextChannel).stopTyping();

  // Send the message to the logs channel.
  await (logsChannel as TextChannel).send(message);
}

/**
 * Add the ClientInt methods to a Discord Client interface.
 *
 * @function
 * @param { Client } client
 * @returns { ClientInt }
 */
function extendsClientToClientInt(client: Client): ClientInt {
  const new_client = client as ClientInt;

  new_client.prefix = {};
  new_client.color = "#AB47E6";

  new_client.setSetting = setSetting;
  new_client.getSettings = getSettings;
  new_client.sendMessageToLogsChannel = sendMessageToLogsChannel;

  return new_client;
}

export default extendsClientToClientInt;
