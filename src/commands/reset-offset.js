const chalk = require('chalk');
const inquirer = require('inquirer');
const utils = require('./_utils');
const topicChooser = utils.topicChooser;
const consumerGroupChooser = utils.consumerGroupChooser;
inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'))

const resetOffset = {
  command: 'reset-offset',
  description: 'Reset offset',
  options: [],
  execute: async (kafka, admin) => {
    const topic = await topicChooser(admin);
    const groupId = await consumerGroupChooser(admin);

    const topicOffsets = await admin.fetchTopicOffsets(topic);
    const groupOffsets = await admin.fetchOffsets({ topic: topic, groupId: groupId });

    groupOffsets.forEach(group => {
      const partitionOffset = topicOffsets.find(topic => topic.partition === group.partition);
      group.lag = `${group.offset != '-1' ? parseInt(partitionOffset.offset) - parseInt(group.offset) : 0}`;
    });

    console.log(chalk.red(`Showing topic metadata...`));
    console.log(groupOffsets);

    // const resetType = (await inquirer.prompt([{
    //   message: 'Do you want to reset by offset number or timestamp?',
    //   type: 'list',
    //   name: 'resetType',
    //   choices: [{
    //     name: 'Offset Number',
    //     value: 'number'
    //   }, {
    //     name: 'Timestamp',
    //     value: 'timestamp'
    //   }]
    // }])).resetType;

    let resetOffset = {
      groupId: groupId,
      topic: topic,
      partitions: []
    };

    for (let i in groupOffsets) {
      const group = groupOffsets[i];
      const offset = (await inquirer.prompt([{
        message: 'Enter the offset number to reset for partition ' + group.partition,
        type: 'number',
        name: 'offset'
      }])).offset;
      resetOffset.partitions.push({
        partition: group.partition,
        offset
      });
    }

    // if (resetType === 'number') {
      
    // } else {
    //   const timestamp = (await inquirer.prompt([{
    //     type: 'datetime',
    //     name: 'dt',
    //     message: 'When would you like to reset offsets?',
    //     initial: new Date('1990-01-01 00:00:00'),
    //   }])).offset;
    //   resetOffset.partitions.push({
    //     partition: group.partition,
    //     offset
    //   });
    // }
    await admin.setOffsets(resetOffset);
    console.log(chalk.red(`Offset reseted for topic ${topic} and group ${groupId}`));
  }
};

exports.default = resetOffset;
