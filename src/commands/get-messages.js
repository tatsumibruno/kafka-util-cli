const inquirer = require('inquirer');
inquirer.registerPrompt("date", require("inquirer-date-prompt"));
const { topicChooser } = require('./_utils');
const chalk = require('chalk');
const os = require('os');
const fs = require('fs');

const getMessages = {
  command: 'get-messages',
  description: 'Get messages from topic',
  options: [],
  execute: async (kafka, admin) => {
    await _clearOldConsumers(admin);
    const topic = await topicChooser(admin);
    const startFromOption = await _readStartFromOption();
    const options = [];
    if (startFromOption === 'datetime') {
      options.push({
        message: 'Read messages since when? ISO format (eg: 2021-01-31T23:59:59-03:00)',
        type: 'input',
        name: 'since',
      });
    }
    options.push({
      message: 'Redirect message to file?',
      type: 'confirm',
      name: 'outputFile',
    });
    const answers = await inquirer.prompt(options);
    const groupId = 'kafka-util-cli-consumer-' + new Date().getTime();
    const consumer = kafka.consumer({ groupId: groupId })
    await consumer.connect();
    await consumer.subscribe({
      topic: topic,
      fromBeginning: startFromOption === 'beginning'
    });
    const filename = os.homedir + '/kafka-util-cli-messages-' + new Date().getTime() + ".txt";
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let output = '\n'
        output += `Key: ${message.key}\nOffset: ${message.offset}\nPartition: ${partition}\nReceived at: ${new Date(parseInt(message.timestamp)).toLocaleString()}`;
        if (message.headers && Object.keys(message.headers).length > 0) {
          const headers = Object.keys(message.headers)
            .map(key => message.headers[key].toString('utf8'))
            .map(header => JSON.parse(header))
            .map(header => `${header.key}=${header.value}`)
            .join(', ');
          output += `\nHeaders: ${headers}`;
        }
        output += '\n' + message.value.toString('utf8');
        if (answers.outputFile) {
          fs.appendFileSync(filename, output + '\n');
        } else {
          console.log(output);
        }
      }
    });
    if (answers.since) {
      const consumeAfter = new Date(Date.parse(answers.since));
      const offsetsByTimestamp = await admin.fetchTopicOffsetsByTimestamp(topic, consumeAfter);
      offsetsByTimestamp.forEach(offset => {
        consumer.seek({ topic: topic, partition: offset.partition, offset: offset.offset })
      });
    }
    if (answers.outputFile) {
      console.log(chalk.inverse('Messages will be written to file ' + filename));
    }
    console.log(chalk.gray('CTRL+C to exit'));
  }
};

async function _clearOldConsumers(admin) {
  const groups = (await admin.listGroups()).groups
    .map(g => g.groupId)
    .filter(groupId => groupId.indexOf('kafka-util-cli-consumer-') == 0);
  if (groups.length > 0)
    try {
      await admin.deleteGroups(groups);
    } catch (e) { }
}

async function _readStartFromOption() {
  return (await inquirer.prompt([{
    message: 'Do you want to listen messages since when?',
    type: 'list',
    name: 'startOption',
    choices: [
      {
        name: 'Beginning',
        value: 'beginning'
      },
      {
        name: 'Now',
        value: 'now'
      },
      {
        name: 'Some date/time',
        value: 'datetime'
      }
    ]
  }])).startOption;
}

exports.default = getMessages;
