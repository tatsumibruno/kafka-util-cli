const inquirer = require('inquirer');

exports.topicChooser = async (admin) => {
  const topics = await admin.listTopics();
  return (await inquirer.prompt([{
    message: 'Wich topic?',
    type: 'list',
    name: 'topic',
    choices: topics.sort().map(t => {
      return {
        name: t,
        value: t
      }
    })
  }])).topic;
};

exports.consumerGroupChooser = async (admin) => {
  const groups = (await admin.listGroups()).groups.map(g => g.groupId);
  return (await inquirer.prompt([{
    message: 'Wich consumer group?',
    type: 'list',
    name: 'groupId',
    choices: groups.sort()
      .map(g => {
        return {
          name: g,
          value: g
        }
      })
  }])).groupId;
};