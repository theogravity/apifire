#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const { inspect } = require('util');
const packageInfo = require('./package.json');
const generator = require('./lib/generator');
const dupeInterfaceRemover = require('./lib/remove-dupe-interfaces');

const red = text => `\x1b[31m${text}\x1b[0m`;
const magenta = text => `\x1b[35m${text}\x1b[0m`;
const yellow = text => `\x1b[33m${text}\x1b[0m`;
const green = text => `\x1b[32m${text}\x1b[0m`;

let openapiFile;
let template;
let baseDir;

const parseOutput = dir => path.resolve(dir);

program
  .version(packageInfo.version)
  .arguments('<openapiFileOrURL> <template>')
  .action((openapiFilePath, tmpl) => {
    if (!openapiFilePath.startsWith('http:') && !openapiFilePath.startsWith('https:')) {
      openapiFile = path.resolve(openapiFilePath);
      baseDir = path.dirname(openapiFile);
    } else {
      openapiFile = openapiFilePath;
    }

    template = tmpl;
  })
  .option('-o, --output <outputDir>', 'directory where to put the generated files (defaults to current directory)', parseOutput, process.cwd())
  .option('-t, --templates <templateDir>', 'directory where templates are located (defaults to internal nodejs templates)')
  .option('-b, --basedir <baseDir>', 'directory to use as the base when resolving local file references (defaults to OpenAPI file directory)')
  .option('-c, --curl', 'generate a curl scripts', false)
  .option('-s, --skipExistingFiles', 'skip existing files')
  .option('-d, --deleteFolders <folderName>', 'directory names to be deleted, e.g. "auto"')
  .parse(process.argv);

if (!openapiFile) {
  console.error(red('> Path to OpenAPI file not provided.'));
  program.help(); // This exits the process
}

const options = program.opts();

generator.generate({
  openapi: openapiFile,
  base_dir: options.basedir || baseDir || process.cwd(),
  target_dir: options.output,
  templates: options.templates ? path.resolve(process.cwd(), options.templates) : undefined,
  curl: options.curl,
  template,
  skipExistingFiles: options.skipExistingFiles,
  deleteFolders: options.deleteFolders
}).then(() => {
  dupeInterfaceRemover(path.resolve(options.output, 'src', 'interfaces', 'api.ts'));
  console.log(green('Done! ✨'));
  console.log(yellow('Check out your shiny new API at ') + magenta(options.output) + yellow('.'));
}).catch(err => {
  console.error(red('Aaww 💩. Something went wrong:'));
  console.error(red(err.stack || err.message || inspect(err, { depth: null })));
});

process.on('unhandledRejection', (err) => console.error(err));
