const inquirer = require('inquirer');
inquirer.registerPrompt("date", require("inquirer-date-prompt"));
const { topicChooser } = require('./_utils');

const publishMessage = {
  command: 'publish-messages',
  description: 'Publish message on topic',
  options: [],
  execute: async (kafka, admin) => {
    const topic = await topicChooser(admin);
    const answer = await inquirer.prompt([
      {
        name: 'key',
        message: 'Fill the key for message (let blank if dont need)',
        type: 'input'
      },
      {
        name: 'payload',
        message: 'Paste the payload',
        type: 'input'
      },
    ]);
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [
        { key: answer.key, value: answer.payload },
      ],
    });
    await producer.disconnect();
  }
};

exports.default = publishMessage;