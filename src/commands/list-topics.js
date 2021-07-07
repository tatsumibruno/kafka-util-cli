const listTopics = {
  command: 'list-topics',
  description: 'List topics',
  options: [],
  execute: async (kafka, admin) => {
    const topics = await admin.listTopics();
    const output = topics.sort().join('\n');
    console.log(output);
  }
};

exports.default = listTopics;