# EventBridge TestEventPattern API - Local

This module provides a local, synchronous implementation of the AWS EventBridge `testEventPattern` API, allowing to test EventBridge event patterns without the need to hit AWS servers. It's designed to be quick, efficient, and easy to integrate.

## Features

- **Local Pattern Testing**: Test EventBridge patterns synchronously without requiring AWS API calls.
- **Easy Integration**: Seamlessly integrates with existing Node.js applications.
- **Comprehensive Pattern Matching**: Supports a wide range of pattern matching features including wildcard, nested field matching, and more.

## Installation

```bash
npm install eb-patterns
```

## Usage

```typescript
import { testEventPattern } from 'eb-patterns';

const event = { /* your AWS event JSON string */ };
const pattern = { /* your AWS eventPattern JSON string */ };

/* 
  behaves same like AWS` testEventPattern method
  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EventBridge.html#testEventPattern-property
*/
const result = testEventPattern({ Event: event, EventPattern: pattern });

console.log(result); // true or false based on pattern matching
```

```typescript
import { testPattern } from 'eb-patterns';

const data = { contact: { name: 'John', age: 30, nationality: 'DE' } };
const pattern = { contact: { name: ['John'], age: [{ numeric: ['>=', 25] } };

// test any patterns
const result = testPattern(data, pattern);

console.log(result); // true or false based on pattern matching
```

## API Reference
`testEventPattern(params)`

- `params`: An object that contains the parameters for `testEventPattern`.
- `params.Event`: This should resemble an EventBridge event's format. It's a JSON string representing a valid object and must include these properties: id, detail-type, source, account, time, region, detail.
- `params.EventPattern`: A JSON string that represents a valid JSON object. It must contain all of the following properties: `detail`

`testPattern(data, pattern)`

- `data`: The data object to test.
- `pattern`: The pattern object against which the event is tested.

Returns `true` if the event matches the pattern, `false` otherwise.

## Available Patterns
| Comparison             | Example                                             | Rule syntax                                              |
|------------------------|-----------------------------------------------------|----------------------------------------------------------|
| Null                   | first_name is null                                  | `"first_name": [ null ]`                                 |
| Empty                  | last_name is empty                                  | `"last_name": [""]`                                      |
| Equals                 | email is "j.doe@email.com"                          | `"email": [ "j.doe@email.com" ]`                         |
| Equals (ignore case)   | first_name is "John"                                | `"first_name": [ { "equals-ignore-case": "john" } ]`     |
| And                    | fist_name is "John" and last_name is "Doe"          | `"first_name": [ "John" ], "last_name": ["Doe"]`         |
| Or                     | payment_type is "Invoice" or "SEPA"                 | `"payment_type": [ "invoice", "sepa"]`                    |
| Or (multiple fields)   | first_name is "John", or last_name is "Doe".        | `"$or": [ { "first_name": [ "John" ] }, { "last_name": [ "Doe" ] } ]` |
| Not                    | status is anything but "cancelled"                  | `"status": [ { "anything-but": [ "cancelled" ] } ]`      |
| Numeric (equals)       | price is 100                                        | `"price": [ { "numeric": [ "=", 100 ] } ]`               |
| Numeric (range)        | price is more than 10, and less than or equal to 20 | `"price": [ { "numeric": [ ">", 10, "<=", 20 ] } ]`      |
| Exists                 | product_name exists                                 | `"product_name": [ { "exists": true } ]`                  |
| Does not exist         | product_name does not exist                         | `"product_name": [ { "exists": false } ]`                 |
| Begins with            | product_name starts with PRO-                       | `"product_name": [ { "prefix": "PRO-" } ]`         |
| Ends with              | filename ends with a .png extension                 | `"filename": [ { "suffix": ".png" } ]`                   |
| Wildcard               | search a string using a wildcard                    | `"email": [ { "wildcard": "*@doe.com" } ]`                   |