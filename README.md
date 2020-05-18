# apifire

A support library designed to work with the `yeoman` generator, 
[`generator-ts-openapi-server`](https://github.com/theogravity/generator-ts-openapi-server).

It takes an OpenAPI 3 spec, and generates routes, controllers, and validators for express in Typescript.

This library is a work-in-progress (alpha level, in my opinion), and works specifically with the
author's use-cases.

## Fork notice

This library is a fork of the [`openapi3-generator`](https://github.com/openapi-contrib/openapi3-generator) project.

### Changes

- Uses a custom `json-schema-ref-parser-alt` build that adds a `x-original-ref` property as a reference to the 
original `$ref` to the output schema, which is useful for static analysis when trying to generate types.
- The templates that came with `openapi3-generator` were removed.
- A new set of templates were added to work with `generator-ts-openapi-server`.
- A prettifier was introduced to prettify the generated Typescript files.

## Install

To use it from the CLI:

```bash
npm install -g apifire
```

## Usage

### Quick usage

In the directory where the `generator-ts-openapi-server` generated service is, run:

`$ apifire api.yaml api-server`

Where `api.yaml` is the OpenAPI 3 spec file. You should always run this command whenever the spec
file changes.

This will generate the following structure:

```
/<service root>
├── src/
|   ├── controllers-generated/
|   |   └──  <operation>.ts
|   ├── interfaces/
|   |   └──  api.ts
|   ├── routers/
|   |   ├── <operation>.router.ts
|   |   ├── validators/
|   |   |   └── <operation>.validator.ts
```

In day-to-day usage, the `controllers-generated/` directory contains the files that you may edit / pluck
to the service's `controllers/` directory as you will implement your business logic in them.

The other directories and their files should never be modified.

### CLI reference

```bash
  Usage: apifire [options] <openapiFileOrURL> <template>

  Options:

    -V, --version                  output the version number
    -o, --output <outputDir>       directory where to put the generated files (defaults to current directory)
    -t, --templates <templateDir>  directory where templates are located (defaults to internal templates directory)
    -b, --basedir <baseDir>        directory to use as the base when resolving local file references (defaults to OpenAPI file directory)
    -h, --help                     output usage information
```

## Authors

* Theo Gravity ([github](http://github.com/richardklose))
* Fran Méndez ([@fmvilas](http://twitter.com/fmvilas))
* Richard Klose ([@richardklose](http://github.com/richardklose))
