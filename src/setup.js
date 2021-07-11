const { Kafka, logLevel } = require('kafkajs');
const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');

const _KAFKA_CLI_DIR = os.homedir() + '/.kafka-cli';
const _KAFKA_CLI_SETTINGS_FILE = _KAFKA_CLI_DIR + '/settings.json';

exports.default = async () => {
  if (!fs.existsSync(_KAFKA_CLI_DIR)) {
    fs.mkdirSync(_KAFKA_CLI_DIR);
  }
  let settings = {};
  if (fs.existsSync(_KAFKA_CLI_SETTINGS_FILE)) {
    const rawData = fs.readFileSync(_KAFKA_CLI_SETTINGS_FILE);
    settings = JSON.parse(rawData);
  }

  settings.brokers = settings.brokers || (await inquirer.prompt([{
    message: 'Enter brokers host addresses, comma separated (eg: localhost:9092,localhost:9093,localhost:9094)',
    type: 'input',
    name: 'brokers'
  }])).brokers;

  settings.sslEnabled = settings.sslEnabled != undefined ? settings.sslEnabled : (await inquirer.prompt([{
    message: 'Do you use SSL?',
    name: 'sslEnabled',
    type: 'confirm',
  }])).sslEnabled;

  settings.authentication = settings.authentication || (await inquirer.prompt([{
    message: 'Which authentication do you use?',
    type: 'list',
    name: 'authentication',
    choices: [
      {
        name: 'None',
        value: 'none',
        extra: null
      },
      {
        name: 'User & password',
        value: 'user-password'
      }
    ]
  }])).authentication;

  const kafka = new Kafka({
    clientId: 'kafka-utils-cli-' + new Date().getTime(),
    brokers: settings.brokers.split(','),
    connectionTimeout: 3000,
    ssl: settings.sslEnabled,
    logLevel: logLevel.ERROR
  });

  switch (settings.authentication) {
    case 'user-password':
      settings.user = settings.user || (await inquirer.prompt([{
        message: 'Type the username',
        name: 'user',
        type: 'input',
      }])).user;
      settings.password = settings.password || (await inquirer.prompt([{
        message: 'Type the password',
        name: 'password',
        type: 'password',
      }])).password;
      kafka.sasl = {
        mechanism: 'plain',
        username: settings.user,
        password: settings.password
      }
      break;
  }

  fs.writeFileSync(_KAFKA_CLI_SETTINGS_FILE, JSON.stringify(settings));
  return kafka;
};
