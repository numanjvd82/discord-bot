import CommandInt from "../../interfaces/CommandInt";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { viewConfigEmbed } from "../../utils/config/viewConfigEmbed";
import { viewHeartsEmbed } from "../../utils/config/viewHeartsEmbed";
import { viewBlockedEmbed } from "../../utils/config/viewBlockedEmbed";
import { viewRolesEmbed } from "../../utils/config/viewRolesEmbed";
import { keyList } from "../../utils/config/keyList";
import { defaultConfigValues } from "../../utils/config/defaultValues";

const config: CommandInt = {
  name: "config",
  description:
    "Returns Becca's configuration for this server. (The parameters are only for server administrators)",
  parameters: [
    "`<action>`: The action you would like to take. `set`, `reset`, or `view`.",
    "`<setting>`: The setting you would like to take action on. See the docs for available options.",
    "`<value>`: The value of that setting (if using `set`). See the docs for available options.",
  ],
  category: "server",
  run: async (message, config) => {
    try {
      // Get the client, current channel, command arguments and current guild, mentions and member of the message.
      const { Becca, channel, commandArguments, guild, member } = message;

      // Check if the guild and member are valid.
      if (!guild || !member) {
        await message.react(message.Becca.no);
        return;
      }

      if (
        !member.hasPermission("MANAGE_GUILD") &&
        member.id !== process.env.OWNER_ID
      ) {
        await message.reply(
          `I am so sorry, but I can only perform this for moderators with the permission to manage the server.`
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get `getTextChannelFromSettings`, the prefix and `setSetting` from the client.
      const { prefix, setSetting } = Becca;

      // Get the next argument as the config type.
      const configType = commandArguments.shift();

      if (configType === "view" || !configType) {
        const target = commandArguments.shift();
        const page = parseInt(commandArguments.shift() || "1");
        switch (target) {
          case "hearts":
            await channel.send(viewHeartsEmbed(config, page));
            break;
          case "blocked":
            await channel.send(viewBlockedEmbed(config, page));
            break;
          case "self_roles":
            await channel.send(viewRolesEmbed(config, page));
            break;
          default:
            await channel.send(viewConfigEmbed(message, config));
        }
        await message.react(message.Becca.yes);
        return;
      }
      const key = commandArguments.shift();

      if (configType === "reset") {
        // If no setting provided, end.
        if (!key) {
          await message.reply(
            "Would you please try the command again, and provide the setting you would like me to reset?"
          );
          await message.react(message.Becca.no);
          return;
        }

        if (!keyList.includes(key)) {
          await message.reply(
            `I am so sorry, but ${key} is not a valid setting option.`
          );
          await message.react(message.Becca.no);
          return;
        }
        await setSetting(guild.id, guild.name, key, defaultConfigValues[key]);
        if (key === "prefix") {
          prefix[guild.id] = defaultConfigValues.prefix;
        }
        await channel.send(
          `Okay, I have reset the ${key} setting to my default value.`
        );
        await message.react(Becca.yes);
        return;
      }

      // Check for valid type
      if (configType === "set") {
        // If no setting provided, end.
        if (!key) {
          await message.reply(
            "Would you please try the command again, and provide th setting you would like me to change?"
          );
          await message.react(message.Becca.no);
          return;
        }

        if (!keyList.includes(key)) {
          await message.reply(
            `I am so sorry, but ${key} is not a valid setting for me to update.`
          );
          await message.react(message.Becca.no);
          return;
        }
        // Get value for setting.
        const value = commandArguments.join(" ");

        // If no value provided, end.
        if (!value) {
          await message.reply(
            "Would you please try the command again, and tell me the value you would like me to set?"
          );
          await message.react(message.Becca.no);
          return;
        }

        // If setting channel, check for valid channel.
        if (
          key === "welcome_channel" ||
          key === "log_channel" ||
          key === "suggestion_channel"
        ) {
          const success = guild.channels.cache.find(
            (chan) => chan.id === value.replace(/\D/g, "")
          );
          if (!success) {
            await message.reply(
              `I am so sorry, but ${value} does not appear to be a valid channel.`
            );
            await message.react(message.Becca.no);
            return;
          }
        }

        // If setting role, check for valid role.
        if (
          key === "restricted_role" ||
          key === "moderator_role" ||
          key === "self_roles"
        ) {
          const success = guild.roles.cache.find(
            (role) => role.id === value.replace(/\D/g, "")
          );
          if (!success && !config[key].includes(value.replace(/\D/g, ""))) {
            await message.reply(
              `I am so sorry, but ${value} does not appear to be a valid role.`
            );
            await message.react(message.Becca.no);
            return;
          }
        }

        // If setting hearts, check for valid user.
        if (key === "hearts" || key === "blocked") {
          const mem = await guild.members.fetch(value.replace(/\D/g, ""));
          if (!mem && !config[key].includes(value.replace(/\D/g, ""))) {
            await message.reply(
              `I am so sorry, but ${value} does not appear to be a valid user.`
            );
            await message.react(message.Becca.no);
            return;
          }
          if (value.replace(/\D/g, "") === process.env.OWNER_ID) {
            await message.reply(
              key === "blocked"
                ? "Wait a moment! I will not refuse to help my beloved."
                : "My love for my darling can never be stopped."
            );
            await message.react(message.Becca.no);
            return;
          }
        }

        // If setting toggle, check for off/on.
        if (key === "thanks" || key === "levels") {
          if (value !== "on" && value !== "off") {
            await message.reply(
              `I am so sorry, but ${value} is not a valid option for ${key}. Please try again and tell me if you want ${key} to be turned \`on\` or \`off\`.`
            );
            await message.react(message.Becca.no);
            return;
          }
        }

        // Set client prefix.
        if (key === "prefix") {
          prefix[guild.id] = value.toLowerCase();
        }

        // Save settings.
        const newSettings = await setSetting(guild.id, guild.name, key, value);

        // Set confirmation response
        let confirmation = `Okay, I have set ${key} to ${value}`;

        // Handle hearts
        if (key === "hearts") {
          if (!newSettings.hearts.includes(value.replace(/\D/g, ""))) {
            confirmation = `Okay, I will stop giving hearts to ${value}!`;
          } else {
            confirmation = `Okay, I will give hearts to ${value}!`;
          }
        }

        // Handle blocked
        if (key === "blocked") {
          if (!newSettings.blocked.includes(value.replace(/\D/g, ""))) {
            confirmation = `Okay, I will resume helping ${value}!`;
          } else {
            confirmation = `Okay, I will stop helping ${value}!`;
          }
        }

        // Handle self roles
        if (key === "self_roles") {
          if (!newSettings.self_roles.includes(value.replace(/\D/g, ""))) {
            confirmation = `Okay, ${value} is no longer self-assignable.`;
          } else {
            confirmation = `Okay, ${value} is now self-assignable.`;
          }
        }

        // Send confirmation.
        await channel.send(confirmation);
        await message.react(message.Becca.yes);
        return;
      }

      await message.reply(
        `I am so sorry, but ${configType} is not a valid action for me to take.`
      );
      await message.react(message.Becca.no);
      return;
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "config command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default config;
