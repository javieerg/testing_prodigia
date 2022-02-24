const { prompt } = require('inquirer');
const program = require('commander');

const XMLs = require('./wrappers/xml');

const xml = new XMLs();

let value = [
  {
    type: 'input',
    name: 'issue',
    message: 'Issue ID'
  }
];

program
  .version('1.0.0')
  .description('Prodigia tester')

// Testing timbrado service
program
  .command('timbrado')
  .alias('t')
  .description('Test timbrado service')
  .action(() => {
    prompt(value).then((answer) => xml.readXML(answer.issue));
  });

program.parse(process.argv);