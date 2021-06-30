const listConsumerGroups = {
  command: 'list-consumer-groups',
  description: 'List all existing consumer groups',
  options: [],
  execute: async (admin) => {
    const metadata = await admin.listGroups();
    const output = metadata.groups.map(g => g.groupId).sort().join('\n');
    console.log(output);
  }
};

exports.default = listConsumerGroups;