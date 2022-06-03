#!/usr/bin/env node

const program = require("commander");
const package = require("../package.json");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Table = require("cli-table");
const figlet = require("figlet");
const { exit } = require("shelljs");
const commandFactory = require("./commands-factory").default;
const setup = require("./setup").default;
const kafka = require("./connection").kafka;
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

program.version(package.version);
console.log(chalk.cyan(figlet.textSync("Kafka Utils CLI")));
console.log(chalk.grey("by Bruno Tatsumi [https://github.com/tatsumibruno]"));

init = async () => {
  let kafkajs;
  let kafkaAdmin;
  try {
    settings = await setup();
    program
      .command("run")
      .option("-p, --profile <profileName>", "Profile name", "default")
      .action(async (options) => {
        const optProfile = options.profile;
        if (!(optProfile in settings.profiles)) {
          console.error('Profile "%s" not found.', optProfile);
          process.exit();
        }

        const settingProfile = settings.profiles[optProfile];
        kafkajs = kafka(settingProfile);
        kafkaAdmin = kafkajs.admin();
        await kafkaAdmin.connect();

        console.log(
          chalk.green("Connected to profile %s [%s]"),
          optProfile,
          settingProfile.brokers
        );

        const answer = await inquirer.prompt([
          {
            message: "Which command do you want to execute?",
            type: "autocomplete",
            name: "command",
            source: function (answersSoFar, input) {
              const commands = commandFactory.listCommands().map((c) => {
                return {
                  name: c.description,
                  value: c.command,
                };
              });
              if (!input) return commands;
              return commands.filter((c) => {
                return c.name.toUpperCase().match(input.toUpperCase());
              });
            },
          },
        ]);
        const command = answer.command;
        const commandRunner = commandFactory.create(command);
        try {
          await commandRunner.execute(kafkajs, kafkaAdmin);
        } catch (error) {
          console.log(error);
        }
        await kafkaAdmin.disconnect();
      });
    program.parse();
  } catch (error) {
    console.log(error);
    await kafkaAdmin.disconnect();
    process.exit();
  }
};

init();
