const inquirer = require('inquirer');
const utils = require('./_utils');
const topicChooser = utils.topicChooser;
const consumerGroupChooser = utils.consumerGroupChooser;

const resetOffset = {
  command: 'reset-offset',
  description: 'Reset offset',
  options: [],
  execute: async (admin) => {
    const topic = await topicChooser(admin);
    const groupId = await consumerGroupChooser(admin);

    const topicOffsets = await admin.fetchTopicOffsets(topic);
    const groupOffsets = await admin.fetchOffsets({ topic: topic, groupId: groupId });

    groupOffsets.forEach(group => {
      const partitionOffset = topicOffsets.find(topic => topic.partition === group.partition);
      group.lag = `${group.offset != '-1' ? parseInt(partitionOffset.offset) - parseInt(group.offset) : 0}`;
    });

    console.log('Showing the topic metadata...');
    console.log(groupOffsets);

    const resetType = (await inquirer.prompt([{
      message: 'Do you want reset by offset number or timestamp?',
      type: 'list',
      name: 'resetType',
      choices: [{
        name: 'Offset Number',
        value: 'number'
      }, {
        name: 'Timestamp',
        value: 'timestamp'
      }]
    }])).resetType;

    let resetOffset = {
      groupId: groupId,
      topic: topic,
      partitions: []
    };
    
    if (resetType === 'number') {
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
    } else {

    }
    await admin.setOffsets(resetOffset);
  }
};

exports.default = resetOffset;