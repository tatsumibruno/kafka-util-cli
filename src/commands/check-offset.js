const chalk = require('chalk');
const { topicChooser, consumerGroupChooser } = require('./_utils');

const checkOffset = {
  command: 'check-offset',
  description: 'Check offset',
  options: [],
  execute: async (kafka, admin) => {
    const topic = await topicChooser(admin);
    const groupId = await consumerGroupChooser(admin);

    const topicOffsets = await admin.fetchTopicOffsets(topic);
    const groupOffsets = await admin.fetchOffsets({ topic: topic, groupId: groupId });

    console.log(chalk.red('Topic offset:'));
    console.log(topicOffsets);

    console.log(chalk.red(`Topic offset for consumer group ${groupId}:`));
    groupOffsets.forEach(group => {
      const partitionOffset = topicOffsets.find(topic => topic.partition === group.partition);
      group.lag = `${group.offset != '-1' ? parseInt(partitionOffset.offset) - parseInt(group.offset) : 0}`;
    });

    console.log(groupOffsets);
  }
};

exports.default = checkOffset;