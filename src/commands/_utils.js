const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

let cachedTopics;
let cachedGroups;

exports.topicChooser = async (admin) => {
  const topics = cachedTopics ? cachedTopics : await admin.listTopics();
  cachedTopics = topics;
  return (await inquirer.prompt([{
    message: 'Which topic? (type something to filter)',
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
  const groups = cachedGroups ? cachedGroups : (await admin.listGroups()).groups.map(g => g.groupId);
  cachedGroups = groups;
  return (await inquirer.prompt([{
    message: 'Which consumer group? (type something to filter)',
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
