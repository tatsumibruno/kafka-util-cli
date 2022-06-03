const { Kafka, logLevel } = require("kafkajs");

exports.kafka = (profile) => {
  return new Kafka({
    clientId: "kafka-utils-cli-" + new Date().getTime(),
    brokers: profile.brokers.split(","),
    connectionTimeout: 3000,
    ssl: settings.sslEnabled,
    logLevel: logLevel.ERROR,
  });
};
