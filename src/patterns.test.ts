import { Pattern } from './types';

import { testEventPattern, testPattern } from './index';

describe('simple-patterns', () => {
  describe('existence checks', () => {
    const data = { first_name: 'John' };

    test('returns true when an existing key is checked for existence', () => {
      const pattern = { first_name: [{ exists: true }] };
      expect(testPattern(data, pattern)).toBe(true);
    });

    test('returns false when a non-existing key is checked for existence', () => {
      const pattern = { last_name: [{ exists: true }] };
      expect(testPattern(data, pattern)).toBe(false);
    });

    test('returns true when a non-existing key is checked for non-existence', () => {
      const pattern = { last_name: [{ exists: false }] };
      expect(testPattern(data, pattern)).toBe(true);
    });

    test('returns false when an existing key is checked for non-existence', () => {
      const pattern = { first_name: [{ exists: false }] };
      expect(testPattern(data, pattern)).toBe(false);
    });
  });

  describe('value checks', () => {
    describe('anything-but', () => {
      const data = { first_name: 'John' };

      test('returns true if the field value is not the excluded value', () => {
        const pattern = { first_name: [{ 'anything-but': ['Doe'] }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value is the excluded value', () => {
        const pattern = { first_name: [{ 'anything-but': ['John'] }] };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });

    describe('equals-ignore-case', () => {
      const data = { first_name: 'john' };

      test('returns true if the field matches the value, case-insensitive', () => {
        const pattern = { first_name: [{ 'equals-ignore-case': 'JohN' }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field does not match the value, case-insensitive', () => {
        const pattern = { first_name: [{ 'equals-ignore-case': 'JahN' }] };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });

    describe('numeric comparison', () => {
      const data = { price: 15 };

      test('returns true if the field value equals the given number', () => {
        const pattern = { price: [{ numeric: ['=', 15] }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value does not equal the given number', () => {
        const pattern = { price: [{ numeric: ['=', 20] }] };
        expect(testPattern(data, pattern)).toBe(false);
      });

      test('returns true if the field value satisfies the range patterns', () => {
        const pattern = { price: [{ numeric: ['>', 10, '<=', 20] }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value does not satisfy the range patterns', () => {
        const dataWithDifferentPrice = { price: 10 };
        const pattern = { price: [{ numeric: ['>', 10, '<=', 20] }] };
        expect(testPattern(dataWithDifferentPrice, pattern)).toBe(false);
      });
    });

    describe('prefix and suffix checks', () => {
      const data = { first_name: 'William' };

      test('returns true if the field value starts with the given prefix', () => {
        const pattern = { first_name: [{ prefix: 'Will' }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value does not start with the given prefix', () => {
        const pattern = { first_name: [{ prefix: 'Joh' }] };
        expect(testPattern(data, pattern)).toBe(false);
      });

      test('returns true if the field value ends with the given suffix', () => {
        const pattern = { first_name: [{ suffix: 'iam' }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value does not end with the given suffix', () => {
        const pattern = { first_name: [{ suffix: 'ohn' }] };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });

    describe('wildcard pattern matching', () => {
      const data = { first_name: 'w.i.l.l//i.a.m' };

      test('returns true if the field value matches the given wildcard pattern', () => {
        const pattern = { first_name: [{ wildcard: '*.i*.l/*i.?.m' }] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if the field value does not match the given wildcard pattern', () => {
        const pattern = { first_name: [{ wildcard: 'i.*.l/*i.?.m' }] };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });

    describe('exact-match checks', () => {
      test('returns true when a single field exactly matches the pattern', () => {
        const data = { first_name: 'John' };
        const pattern = { first_name: ['John'] };

        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns true when multiple fields exactly match their respective patterns', () => {
        const data = { first_name: 'John', last_name: 'Doe' };
        const pattern = { first_name: ['John'], last_name: ['Doe'] };

        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false when the case of the field value does not match the case-sensitive pattern', () => {
        const data = { first_name: 'John' };
        const pattern = { first_name: ['john'] };

        expect(testPattern(data, pattern)).toBe(false);
      });

      test('returns false when a field value does not match the pattern', () => {
        const data = { first_name: 'John' };
        const pattern = { first_name: ['doe'] };

        expect(testPattern(data, pattern)).toBe(false);
      });

      test('returns false when one of multiple fields does not match the pattern', () => {
        const data = { first_name: 'John', last_name: 'Doe' };
        const pattern = { first_name: ['John'], last_name: ['Peter'] };

        expect(testPattern(data, pattern)).toBe(false);
      });

      test('returns true when an array field matches the array pattern', () => {
        const data = { first_name: ['John'] };
        const pattern = { first_name: ['John'] };

        expect(testPattern(data, pattern)).toBe(true);
      });
    });
  });

  describe('empty-type checks', () => {
    test('returns true when a null field matches a null pattern', () => {
      const data: Record<string, any> = { first_name: null };
      const pattern: Record<string, any> = { first_name: [null] };

      expect(testPattern(data, pattern)).toBe(true);
    });

    test('returns false when a null field does not match a non-null pattern', () => {
      const data: Record<string, any> = { first_name: null };
      const pattern = { first_name: ['john'] };

      expect(testPattern(data, pattern)).toBe(false);
    });

    test('returns false when an empty string field does not match a non-empty pattern', () => {
      const data = { first_name: '' };
      const pattern = { first_name: ['john'] };

      expect(testPattern(data, pattern)).toBe(false);
    });

    test('returns true when the field to check is absent in the data and the pattern is null', () => {
      const data = { first_name: 'John' };
      const pattern: Record<string, any> = { last_name: [null] };

      expect(testPattern(data, pattern)).toBe(true);
    });
  });

  describe('complex patterns', () => {
    describe('or patterns', () => {
      const data = { contact: { first_name: 'John', last_name: 'Doe', age: 35, isEmployed: true } };

      test('returns true if at least one pattern within $or matches', () => {
        const pattern: Pattern = {
          contact: {
            $or: [{ first_name: ['John'] }, { age: [{ numeric: ['>', 40] }] }],
          },
        };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false if no patterns within $or match', () => {
        const pattern: Pattern = {
          contact: {
            $or: [{ first_name: [{ 'anything-but': ['John'] }] }, { age: [{ numeric: ['>', 40] }] }],
          },
        };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });

    describe('2nd level nested json structure matching', () => {
      const data = { entity: { contact: { first_name: 'John' } } };

      test('returns true for an exact match within a complex nested JSON structure', () => {
        const pattern = { entity: { contact: { first_name: ['John'] } } };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns true for an exact match using dot-notation in JSON keys', () => {
        const pattern = { 'entity.contact.first_name': ['John'] };
        expect(testPattern(data, pattern)).toBe(true);
      });

      test('returns false for a non-matching value within a complex nested JSON structure', () => {
        const pattern = { entity: { contact: { first_name: ['Jane'] } } };
        expect(testPattern(data, pattern)).toBe(false);
      });
    });
  });
});

describe('event-bridge-patterns', () => {
  const baseEvent = {
    id: 'bb689db2-2b7b-ee72-afd3-fd6d7df7ae12',
    account: '912468240823',
    time: '2023-11-05T08:14:33Z',
    region: 'eu-central-1',
    detail: {},
  };

  const baseEventPattern = {
    detail: {},
  };

  test('Validates complete match of event with a straightforward pattern', () => {
    const event = {
      ...baseEvent,
      source: 'aws.ec2',
      'detail-type': 'EC2 Instance State-change Notification',
      detail: { state: 'running' },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['aws.ec2'],
      'detail-type': ['EC2 Instance State-change Notification'],
      detail: { state: ['running'] },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(true);
  });

  test('Confirms no match when event partially aligns with a pattern', () => {
    const event = {
      ...baseEvent,
      source: 'aws.ec2',
      'detail-type': 'EC2 Instance State-change Notification',
      detail: { state: 'stopped' },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['aws.ec2'],
      'detail-type': ['EC2 Instance State-change Notification'],
      detail: { state: ['running'] },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(false);
  });

  test('Ensures matching functionality with multiple possible values for a single key', () => {
    const event = { ...baseEvent, source: 'aws.rds', 'detail-type': 'RDS DB Instance Event' };
    const pattern = {
      ...baseEventPattern,
      source: ['aws.ec2', 'aws.rds'],
      'detail-type': ['RDS DB Instance Event', 'EC2 Instance State-change Notification'],
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(true);
  });

  test('Checks for correct matching of nested fields within an event', () => {
    const event = {
      ...baseEvent,
      source: 'aws.s3',
      'detail-type': 'Amazon S3 Object Level Operations',
      detail: { bucket: { name: 'myBucket' }, object: { key: 'myObject.txt' } },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['aws.s3'],
      detail: { bucket: { name: ['myBucket'] }, object: { key: ['myObject.txt'] } },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(true);
  });

  test('Verifies pattern matching with wildcards in event fields', () => {
    const event = {
      ...baseEvent,
      source: 'custom.app',
      'detail-type': 'App Data Update',
      detail: { id: 12345, status: 'processed' },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['custom.app'],
      'detail-type': ['App Data Update'],
      'detail.status': [{ wildcard: 'process*' }],
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(true);
  });

  test('Assesses pattern matching with an inverted condition to validate exclusion logic', () => {
    const event = {
      ...baseEvent,
      source: 'aws.lambda',
      'detail-type': 'Lambda Function Invocation',
      detail: { function: 'ProcessData' },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['aws.lambda'],
      'detail-type': ['Lambda Function Invocation'],
      detail: { function: [{ 'anything-but': ['ProcessData'] }] },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(false);
  });

  test('Evaluates pattern matching accuracy with complex, multi-criteria patterns', () => {
    const event = {
      ...baseEvent,
      source: 'custom.analytics',
      'detail-type': 'Data Processed',
      detail: { project: 'Alpha', status: 'success', records: 500 },
    };
    const pattern = {
      ...baseEventPattern,
      source: ['custom.analytics'],
      'detail-type': ['Data Processed'],
      detail: { project: ['Alpha', 'Beta'], status: ['error', 'success'], records: [{ numeric: ['>=', 100] }] },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(true);
  });

  test('Tests for the correct handling of patterns that specify the absence of certain fields', () => {
    const event = {
      ...baseEvent,
      source: 'custom.reporting',
      detail: { reportId: 987, generated: true },
      'detail-type': 'Custom-Reporting',
    };
    const pattern = {
      ...baseEventPattern,
      source: ['custom.reporting'],
      detail: { reportId: [987], generated: [{ exists: false }] },
    };

    expect(testEventPattern({ Event: JSON.stringify(event), EventPattern: JSON.stringify(pattern) })).toBe(false);
  });
});
