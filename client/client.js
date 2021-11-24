const grpc = require('grpc');
const greets = require('../server/protos/greet_pb');
const calc = require('../server/protos/calculator_pb');
const greetService = require('../server/protos/greet_grpc_pb');
const calcService = require('../server/protos/calculator_grpc_pb');

async function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

/**
 * Call greeting API
 */
function callGreeting() {
  const client = new greetService.GreetingServiceClient(
    '127.0.0.1:50051',
    grpc.credentials.createInsecure()
  );

  const request = new greets.GreetRequest();
  const greeting = new greets.Greeting();
  greeting.setFirstName('Orkhan');
  greeting.setLastName('Huseynli');
  request.setGreeting(greeting);

  client.greet(request, (error, response) => {
    if (!error) {
      console.log('GreetResponse: ' + response.getResult());
    } else {
      console.log(error);
    }
  });
}

/**
 * Call greeting streming API
 */
function callGreetManyTimes() {
  const client = new greetService.GreetingServiceClient(
    '127.0.0.1:50051',
    grpc.credentials.createInsecure()
  );

  const request = new greets.GreetManyTimesRequest();
  const greeting = new greets.Greeting();
  greeting.setFirstName('Orxan');
  greeting.setLastName('Huseynli');
  request.setGreeting(greeting);

  const call = client.greetManyTimes(request, () => {});
  call.on('data', (response) => {
    console.log('Streaming response ' + response.getResult());
  });

  call.on('status', (status) => console.log(status));
  call.on('error', (error) => console.log(error));
  call.on('end', () => console.log('Stream ended.'));
}

/**
 * Call long greet API
 */
function callLongGreet() {
  const client = new greetService.GreetingServiceClient(
    '127.0.0.1:50051',
    grpc.credentials.createInsecure()
  );

  const request = new greets.LongGreetRequest();

  const call = client.longGreet(request, (error, response) => {
    if (!error) {
      console.log('LongGreetResponse: ' + response.getResult());
    } else {
      console.log('Something went wrong');
    }
  });

  let count = 0,
    intervalId = setInterval(() => {
      console.log('Sending message ' + count);

      const request = new greets.LongGreetRequest();
      const greeting = new greets.Greeting();
      greeting.setFirstName('Orxan');
      greeting.setLastName('Huseynli');
      request.setGreeting(greeting);

      call.write(request);

      if (++count > 4) {
        clearInterval(intervalId);
        call.end();
      }
    }, 1000);
}

/**
 * Call bidirectional streaming API
 */
async function callBidirect() {
  const client = new greetService.GreetingServiceClient(
    '127.0.0.1:50051',
    grpc.credentials.createInsecure()
  );

  const request = new greets.GreetEveryoneRequest();

  const call = client.greetEveryone(request, (error, response) => {
    console.log('Server response ' + response);
  });

  call.on('data', (response) => {
    console.log('Response ' + response.getResult());
  });
  call.on('error', (error) => console.log(error));
  call.on('end', () => console.log('Client the end.'));

  for (let i = 0; i < 10; i++) {
    const request = new greets.GreetEveryoneRequest();
    const greeting = new greets.Greeting();
    greeting.setFirstName('Orxan');
    greeting.setLastName('Huseynli');
    request.setGreeting(greeting);

    call.write(request);
    await sleep(1500);
  }
}

/**
 * Call calculator squareRoot API
 */
function callSquareRoot() {
  const client = new calcService.CalculatorServiceClient(
    '127.0.0.1:50051',
    grpc.credentials.createInsecure()
  );

  const request = new calc.SquareRootRequest();
  request.setNumber(16);

  client.squareRoot(request, (err, response) => {
    if (!err) {
      console.log('Result ' + response.getNumberRoot());
    } else {
      console.log(err);
    }
  });
}

function main() {
  callSquareRoot();
}

main();
