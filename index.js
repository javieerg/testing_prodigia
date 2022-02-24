const { prompt } = require('inquirer');
const program = require('commander');

if (process.env.NODE_ENV.trim() !== "dev") {
  console.log("Loading LOCAL env");
  require("./config/local");
} else {
  console.log("Loading DEV env");
  require("./config/dev");
}

const XMLs = require('./workers/prodigia/xml');

const xml = new XMLs();

let value = [
  {
    type: 'input',
    name: 'xml',
    message: 'XML name'
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
    prompt(value).then((answer) => xml.readXML(answer.xml));
  });

program.parse(process.argv);