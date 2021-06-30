const { topicChooser } = require('./_utils');

const listTopics = {
  command: 'delete-topic',
  description: 'Delete topic',
  options: [],
  execute: async (admin) => {
    const topic = await topicChooser(admin);
    await admin.deleteTopics({
      topics: [topic],
      timeout: 3000,
    });
  }
};

exports.default = listTopics;