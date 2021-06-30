const commandRunners = [
  require('./commands/list-topics').default,
  require('./commands/list-consumer-groups').default,
  require('./commands/check-offset').default,
  require('./commands/reset-offset').default,
]

const factory = {
  create: (command) => commandRunners.find(c => c.command == command),
  listCommands: () => commandRunners
};

exports.default = factory;