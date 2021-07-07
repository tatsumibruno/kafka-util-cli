const commandRunners = [
  require('./commands/list-topics').default,
  require('./commands/delete-topic').default,
  require('./commands/list-consumer-groups').default,
  require('./commands/check-offset').default,
  require('./commands/reset-offset').default,
  require('./commands/get-messages').default,
]

const factory = {
  create: (command) => commandRunners.find(c => c.command == command),
  listCommands: () => commandRunners
};

exports.default = factory;