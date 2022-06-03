const inquirer = require("inquirer");
const os = require("os");
const fs = require("fs");

const _KAFKA_CLI_DIR = os.homedir() + "/.kafka-cli";
const _KAFKA_CLI_SETTINGS_FILE = _KAFKA_CLI_DIR + "/settings.json";

exports.default = async () => {
  if (!fs.existsSync(_KAFKA_CLI_DIR)) {
    fs.mkdirSync(_KAFKA_CLI_DIR);
  }
  let settings = {
    profiles: {
      default: {},
    },
  };
  if (fs.existsSync(_KAFKA_CLI_SETTINGS_FILE)) {
    const rawData = fs.readFileSync(_KAFKA_CLI_SETTINGS_FILE);
    settings = JSON.parse(rawData);

    if (!("profiles" in settings)) {
      console.error(
        `Wrong settings format, the '${_KAFKA_CLI_SETTINGS_FILE}' file should be in this format, Ex:`
      );
      console.error(
        `{ profiles: { default: { brokers: "localhost:9092,localhost:9093,localhost:9094", "sslEnabled": "false" }}}`
      );
      process.exit();
    }
  }

  const defaultProfile = settings.profiles["default"];

  defaultProfile.brokers =
    defaultProfile.brokers ||
    (
      await inquirer.prompt([
        {
          message:
            "Enter brokers host addresses, comma separated (eg: localhost:9092,localhost:9093,localhost:9094)",
          type: "input",
          name: "brokers",
        },
      ])
    ).brokers;

  defaultProfile.sslEnabled =
    defaultProfile.sslEnabled != undefined
      ? defaultProfile.sslEnabled
      : (
          await inquirer.prompt([
            {
              message: "Do you use SSL?",
              name: "sslEnabled",
              type: "confirm",
            },
          ])
        ).sslEnabled;

  defaultProfile.authentication =
    defaultProfile.authentication ||
    (
      await inquirer.prompt([
        {
          message: "Which authentication do you use?",
          type: "list",
          name: "authentication",
          choices: [
            {
              name: "None",
              value: "none",
              extra: null,
            },
            {
              name: "User & password",
              value: "user-password",
            },
          ],
        },
      ])
    ).authentication;

  switch (defaultProfile.authentication) {
    case "user-password":
      defaultProfile.user =
        defaultProfile.user ||
        (
          await inquirer.prompt([
            {
              message: "Type the username",
              name: "user",
              type: "input",
            },
          ])
        ).user;
      defaultProfile.password =
        defaultProfile.password ||
        (
          await inquirer.prompt([
            {
              message: "Type the password",
              name: "password",
              type: "password",
            },
          ])
        ).password;
      kafka.sasl = {
        mechanism: "plain",
        username: defaultProfile.user,
        password: defaultProfile.password,
      };
      break;
  }

  fs.writeFileSync(_KAFKA_CLI_SETTINGS_FILE, JSON.stringify(settings, null, 4));
  return settings;
};
