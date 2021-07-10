const chalk = require('chalk');
const inquirer = require('inquirer');
const { topicChooser } = require('./_utils');

const listTopics = {
  command: 'delete-topic',
  description: 'Delete topic',
  options: [],
  execute: async (kafka, admin) => {
    const topic = await topicChooser(admin);
    const answer = await inquirer.prompt([{
      name: 'confirm',
      message: 'Are you sure?',
      type: 'confirm'
    }]);
    if (answer.confirm === true) {
      await admin.deleteTopics({
        topics: [topic],
        timeout: 3000,
      });
      console.log(chalk.red(`Topic ${topic} deleted`));
    }
  }
};

exports.default = listTopics;