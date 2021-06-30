const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

exports.topicChooser = async (admin) => {
  const topics = await admin.listTopics();
  return (await inquirer.prompt([{
    message: 'Wich topic? (type something to filter)',
    type: 'autocomplete',
    name: 'topic',
    source: function(answersSoFar, input) {
      if (!input) {
        return topics.sort();
      }
      return topics.filter(t => t.toUpperCase().match(input.toUpperCase())).sort();
    }
  }])).topic;
};

exports.consumerGroupChooser = async (admin) => {
  const groups = (await admin.listGroups()).groups.map(g => g.groupId);
  return (await inquirer.prompt([{
    message: 'Wich consumer group? (type something to filter)',
    type: 'autocomplete',
    name: 'groupId',
    source: function(answersSoFar, input) {
      if (!input) {
        return groups.sort();
      }
      return groups.filter(g => g.toUpperCase().match(input.toUpperCase())).sort();
    }
  }])).groupId;
};