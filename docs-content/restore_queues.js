#!/usr/bin/env node

'use strict';

/**
 * This script will restore the queues found in a export file created
 * with the rabitmqadmin script on a given rabbitmq instance.
 * Queues with a name prefixed with "amq." cannot be restored.
 */

const fs = require('fs')
const spawn = require('child_process').spawn;

if (process.argv.length < 3) {
  console.error("Usage:")
  console.error(" restore_queues.js python_path rabbitmqadmin_path hostname port username password backup_filename")
  //                                     ^2           ^3              ^4      ^5    ^6       ^7          ^8
  console.error("E.g.: restore_queues.js /usr/local/bin/python ~/Downloads/rabbitmqadmin 127.0.0.1 15672 frank xxx ./backup_settings.json")
  process.exit(1)
}

const pythonPath = process.argv[2]

const args = []

args.push(process.argv[3])

args.push("-H")
args.push(process.argv[4])

args.push("-P")
args.push(process.argv[5])

args.push("-u")
args.push(process.argv[6])

args.push("-p")
args.push(process.argv[7])

args.push("declare")
args.push("queue")

const backupFile = process.argv[8]

const data = require(backupFile)

if (!data.queues) {
  console.error("No queues found in backup.")
  process.exit(2)
}

data.queues.forEach(function (queue) {
  const queueArgs = []

  queueArgs.push("name=" + queue.name)
  queueArgs.push("auto_delete=" + queue.auto_delete)
  queueArgs.push("durable=" + queue.durable)
  queueArgs.push("arguments=" + JSON.stringify(queue.arguments))

  const allArgs = args.concat(queueArgs)

  console.log("Executing: " + pythonPath + " " + allArgs.join(" "))
  spawn(pythonPath, allArgs, { stdio: 'inherit' })
})
