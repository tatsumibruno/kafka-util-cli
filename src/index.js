#!/usr/bin/env node

const { Kafka } = require('kafkajs')
const program = require('commander');
const package = require('../package.json');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table');
const figlet = require('figlet');
const shell = require('shelljs');
const commandFactory = require('./commands-factory').default;

program.version(package.version);
console.log(chalk.cyan(figlet.textSync('Kafka Utils CLI')));
console.log(chalk.grey('by Bruno Tatsumi [https://github.com/tatsumibruno]'));

const kafka = new Kafka({
	clientId: 'kafka-utils-cli',
	brokers: ['localhost:9092']
});

const admin = kafka.admin();

init = async () => {
	try {
		await admin.connect();
		program
			.command('run [command]')
			.action(async (command) => {
				if (!command) {
					const answer = await inquirer.prompt([
						{
							message: 'Wich command do you want to execute?',
							type: 'list',
							name: 'command',
							choices: commandFactory.listCommands()
								.map(c => {
									return {
										name: c.description,
										value: c.command
									}
								})
						}
					]);
					command = answer.command;
				}
				const commandRunner = commandFactory.create(command);
				try {
					await commandRunner.execute(admin);
				} catch (error) {
					console.log(error);
				}
				await admin.disconnect();
			});
		program.parse(process.argv);
	} catch (error) {
		console.log(error);
		await admin.disconnect();
		process.exit();
	}
};

init();