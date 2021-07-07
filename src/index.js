#!/usr/bin/env node

const program = require('commander');
const package = require('../package.json');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table');
const figlet = require('figlet');
const shell = require('shelljs');
const commandFactory = require('./commands-factory').default;
const setup = require('./setup').default;

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