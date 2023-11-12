import { Comparison, DataValue } from './types';

// Check if the provided object conforms to one of the Comparison types.
const isComparison = (obj: unknown): obj is Comparison => {
  const propNames = ['equals-ignore-case', 'anything-but', 'numeric', 'exists', 'prefix', 'suffix', 'wildcard'];

  return typeof obj === 'object' && propNames.some((prop) => Object.prototype.hasOwnProperty.call(obj, prop));
};

const getValueByPath = (obj: Record<string, any>, path: string) => {
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
};

// Function to handle numeric comparisons.
const handleNumericComparison = (dataValue: DataValue, conditions: Array<string | number>): boolean => {
  for (let i = 0; i < conditions.length; i += 2) {
    const operator = conditions[i] as string;
    const value = conditions[i + 1] as number;
    if (!checkNumericCondition(dataValue, operator, value)) {
      return false;
    }
  }

  // If all conditions are met, return true.
  return true;
};

// Checks a numeric condition on the data value against the expected value with the operator.
const checkNumericCondition = (dataValue: DataValue, operator: string, value: number): boolean => {
  const numericVal = getNumericValue(dataValue);
  // If we can't convert to a numeric value, return false as the condition can't be met.
  if (numericVal === undefined) return false;

  // Compare the numeric value against the expected value using the provided operator.
  switch (operator) {
    case '=':
      return numericVal === value;
    case '>':
      return numericVal > value;
    case '<':
      return numericVal < value;
    case '>=':
      return numericVal >= value;
    case '<=':
      return numericVal <= value;
    default:
      return false; // If the operator is unknown, the condition fails.
  }
};

// Function to safely attempt converting a DataValue to a numeric value.
const getNumericValue = (value: DataValue): number | undefined => {
  if (typeof value === 'number') {
    return value; // If already a number, return it.
  } else if (typeof value === 'string') {
    const parsed = Number(value);
    // We return the parsed number only if it's a valid integer.
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }

  // If not a number or cannot be parsed into one, return undefined.
  return undefined;
};

const handleWildcardComparison = (dataValue: string, condition: string): boolean => {
  const toRegex = (str: string) =>
    new RegExp(
      '^' +
        str
          // eslint-disable-next-line no-useless-escape
          .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$',
    );

  return toRegex(condition).test(dataValue);
};

const eventRequiredFields = ['id', 'detail-type', 'source', 'account', 'time', 'region', 'detail'];
const patternRequiredFields = ['detail'];

export {
  isComparison,
  getValueByPath,
  handleNumericComparison,
  handleWildcardComparison,
  eventRequiredFields,
  patternRequiredFields,
};
