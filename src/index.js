#!/usr/bin/env node

const program = require('commander');
const package = require('../package.json');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table');
const figlet = require('figlet');
const commandFactory = require('./commands-factory').default;
const setup = require('./setup').default;
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

program.version(package.version);
console.log(chalk.cyan(figlet.textSync('Kafka Utils CLI')));
console.log(chalk.grey('by Bruno Tatsumi [https://github.com/tatsumibruno]'));

init = async () => {
	let kafkajs
	let kafkaAdmin;
	try {
		kafkajs = await setup();
		kafkaAdmin = kafkajs.admin();
		await kafkaAdmin.connect();
		program
			.command('run')
			.action(async () => {
				const answer = await inquirer.prompt([
					{
						message: 'Which command do you want to execute?',
						type: 'autocomplete',
						name: 'command',
						source: function (answersSoFar, input) {
							const commands = commandFactory.listCommands()
								.map(c => {
									return {
										name: c.description,
										value: c.command
									};
								});
							if (!input)
								return commands;
							return commands.filter(c => {
								return c.name.toUpperCase().match(input.toUpperCase());
							});
						}
					}
				]);
				const command = answer.command;
				const commandRunner = commandFactory.create(command);
				try {
					await commandRunner.execute(kafkajs, kafkaAdmin);
				} catch (error) {
					console.log(error);
				}
				await kafkaAdmin.disconnect();
			});
		program.parse(process.argv);
	} catch (error) {
		console.log(error);
		await kafkaAdmin.disconnect();
		process.exit();
	}
};

init();
