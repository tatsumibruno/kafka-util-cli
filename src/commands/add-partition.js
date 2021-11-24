const inquirer = require('inquirer');
const { topicChooser } = require('./_utils');

const addPartitions = {
  command: 'add-partition',
  description: 'Add partitions to a topic',
  options: [],
  execute: async (kafka, admin) => {
    const topic = await topicChooser(admin);
    const partitions = (await inquirer.prompt([{
      message: 'How many partitions do you want to set?',
      type: 'number',
      name: 'partitions'
    }])).partitions;
    return admin
      .createPartitions({
        topicPartitions: [{
          topic,
          count: partitions
        }]
      })
      .then(() => console.log('Partitions created successfully'))
      .catch(error => console.log('Error while creating partitions: ' + console))
  }
};

exports.default = addPartitions;