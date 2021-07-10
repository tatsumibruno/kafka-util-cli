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
      {
        name: 'headers',
        message: 'Any header? Let it blank or paste in format: key1:value1,key2:value2',
        type: 'input',
        validate: (input) => {
          if (!input)
            return true;
          const headers = input.split(',')
            .map(entry => {
              const splittedEntry = entry.split(":");
              return {
                key: splittedEntry[0],
                value: splittedEntry[1]
              };
            });
          return headers.length > 0 && headers.every(h => h.key != undefined && h.value != undefined) ? true : "Invalid format";
        }
      },
    ]);
    const producer = kafka.producer();
    await producer.connect();
    const payload = { key: answer.key, value: answer.payload };
    console.log(answer.headers);
    if (answer.headers) {
      payload.headers = answer.headers.split(',')
        .map(entry => {
          const splittedEntry = entry.split(":");
          return JSON.stringify({
            key: splittedEntry[0],
            value: splittedEntry[1]
          });
        });
    }
    await producer.send({
      topic: topic,
      messages: [payload],
    });
    await producer.disconnect();
  }
};

exports.default = publishMessage;