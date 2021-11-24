const grpc = require('grpc');
const greets = require('./protos/greet_pb');
const calc = require('./protos/calculator_pb');
const greetService = require('./protos/greet_grpc_pb');
const calcService = require('./protos/calculator_grpc_pb');

/**
 * Implements the greet RPC service
 */
function greet(call, callback) {
  const greeting = new greets.GreetResponse();
  greeting.setResult('Hello, ' + call.request.getGreeting().getFirstName());
  callback(null, greeting);
}

/**
 * Implements greetManyTimes RPC service
 */
function greetManyTimes(call) {
  const firstName = call.request.getGreeting().getFirstName();

  let count = 0,
    intervalId = setInterval(() => {
      const greetManyTimesResponse = new greets.GreetManyTimesResponse();
      greetManyTimesResponse.setResult('Hello, ' + firstName);
      call.write(greetManyTimesResponse);
      if (++count > 9) {
        clearInterval(intervalId);
        call.end();
      }
    }, 1000);
}

/**
 * Implements longGreet RPC service
 */
function longGreet(call, callback) {
  call.on('data', (request) => {
    const fullName = request.getGreeting().getFirstName() + ' ';
    request.getGreeting().getLastName();

    console.log('Hello, ' + fullName);
  });

  call.on('error', (error) => console.log(error));
  call.on('end', () => {
    const response = new greets.LongGreetResponse();
    response.setResult('Thanks for sending this many messages');
    callback(null, response);
  });
}

async function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

/**
 * Implements greetEveryone RPC service
 */
async function greetEveryone(call, callback) {
  call.on('data', (request) => {
    const fullName = request.getGreeting().getFirstName() + ' ';
    request.getGreeting().getLastName();
    console.log('Hello, ' + fullName);
  });

  call.on('error', (error) => console.log(error));
  call.on('end', () => {
    console.log('The end...');
  });

  for (let i = 0; i < 10; i++) {
    const response = new greets.GreetEveryoneResponse();
    response.setResult('Hell from stream response');
    call.write(response);
    await sleep(1000);
  }

  call.end();
}

function squareRoot(call, callback) {
  const number = call.request.getNumber();
  if (number >= 0) {
    const response = new calc.SquareRootResponse();
    response.setNumberRoot(Math.sqrt(number));
    callback(null, response);
  } else {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Provided number is not positive. number: ' + number,
    });
  }
}

function main() {
  const server = new grpc.Server();

  server.addService(greetService.GreetingServiceService, {
    greet,
    greetManyTimes,
    longGreet,
    greetEveryone,
  });

  server.addService(calcService.CalculatorServiceService, {
    squareRoot,
  });

  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  server.start();

  console.log('Server running on 127.0.0.1:50051');
}

main();
