import { TextChannel } from "discord.js";
import CommandInt from "../../interfaces/CommandInt";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

const suggestion: CommandInt = {
  name: "suggestion",
  description: "Use this command to approve or deny a suggestion.",
  parameters: [
    "`<approve/deny>`: Whether to approve or deny the suggestion",
    "<ID>: The Discord ID of the message containing the suggestion.",
  ],
  category: "server",
  run: async (message, config) => {
    try {
      const { author, Becca, channel, commandArguments, guild, member } =
        message;

      if (!guild) {
        return;
      }

      if (!member || !member.hasPermission("MANAGE_GUILD")) {
        await message.reply(
          "Sorry, but this command is restricted to moderators with the Manage Server permission."
        );
        await message.react(Becca.no);
        return;
      }
      const action = commandArguments.shift();

      if (action !== "approve" && action !== "deny") {
        await message.reply(
          `Sorry, but ${action} is not valid. Would you like to approve or deny this suggestion?`
        );
        await message.react(Becca.no);
        return;
      }

      const id = commandArguments.shift();

      if (!id) {
        await message.reply(
          "Sorry, but what is the message ID for the suggestion you would like me to update?"
        );
        return;
      }

      const suggestionChannel = guild.channels.cache.find(
        (chan) => chan.id === config.suggestion_channel
      );

      if (!suggestionChannel) {
        await message.reply(
          "Sorry, but I cannot find your suggestion channel."
        );
        await message.react(Becca.no);
        return;
      }

      const target = await (suggestionChannel as TextChannel).messages.fetch(
        id
      );

      if (!target) {
        await message.reply("Sorry, but I could not find that suggestion.");
        await message.react(Becca.no);
        return;
      }

      const suggestion = target.embeds[0];

      if (!suggestion || suggestion.title !== "New Suggestion!") {
        await message.reply(
          "Sorry, but this does not appear to be a suggestion message."
        );
        await message.react(Becca.no);
        return;
      }

      if (suggestion.fields.length) {
        await message.reply(
          "Sorry, but it looks like someone has already taken action on this suggestion."
        );
        await message.react(Becca.no);
        return;
      }

      suggestion.addField(
        action === "approve"
          ? "Suggestion approved by"
          : "Suggestion denied by",
        `<@!${author.id}>`
      );

      suggestion.addField(
        "Reason",
        commandArguments.join(" ") || "No reason given"
      );

      target.edit(suggestion);

      await channel.send("Okay, I have updated that suggestion.");
      await message.react(Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "suggestion command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default suggestion;
