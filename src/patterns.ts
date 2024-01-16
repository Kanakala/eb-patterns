import { Comparison, PatternValue, Pattern, Data, DataValue } from './types'
import { eventRequiredFields, getValueByPath, getValueByWildcardPath, handleNumericComparison, handleWildcardComparison, isComparison, patternRequiredFields } from './util'

// Core function to check if data matches the provided pattern.
export const testPattern = (data: Data, pattern: Pattern): boolean =>
  Object.keys(pattern).every((key) => matchPatternKey(data, pattern, key))

// Core function to check an EventBridge pattern with an event.
export const testEventPattern = ({ Event: event, EventPattern: eventPattern }: { Event: string, EventPattern: string }): boolean => {
  const eventJson: Data = JSON.parse(event)
  const eventPatternJson: Pattern = JSON.parse(eventPattern)

  if (!eventRequiredFields.every(field => eventJson[field]) || !patternRequiredFields.every(field => eventPatternJson[field])) {
    throw Error('Parameter Event is not valid.')
  }
  return Object.keys(eventPatternJson).every((key) => matchPatternKey(eventJson, eventPatternJson, key))
}

// Matches a single key from the pattern against the data.
const matchPatternKey = (data: Data, pattern: Pattern, key: string): boolean => {
  // Handle the special '$or' operator by checking if any of the patterns match.
  if (key === '$or') {
    return (pattern[key] as Pattern[]).some((pattern) => testPattern(data, pattern))
  } else {
    const patternValues: PatternValue = pattern[key] as PatternValue

    // when the key contains a wildcard, then fetching all the original values
    // and later matching if at least one of the value matches with the pattern
    if (key.includes('*')) {
      const actualDataValues = getValueByWildcardPath(data, key)

      // if there is no original value, then comparing the pattern with undefined
      if (!actualDataValues?.length) return matchValueWithPatternValues(patternValues, undefined)
      return actualDataValues.some(actualDataValue => matchValueWithPatternValues(patternValues, actualDataValue))
    }

    const actualDataValue = getValueByPath(data, key)
    return matchValueWithPatternValues(patternValues, actualDataValue)
  }
}

const matchValueWithPatternValues = (patternValues: PatternValue, actualDataValue: any) => {
  // If the pattern value is an array, try to match any of the patterns.
  if (Array.isArray(patternValues)) {
    return patternValues.some((patternValue) => matchValue(actualDataValue, patternValue))
  } else {
    // If it's an object, we assume it's a nested pattern and match recursively.
    return testPattern(actualDataValue as Data, patternValues)
  }
}

// Validates a single value from data against the corresponding pattern value.
const matchValue = (dataValue: DataValue, patternValue: Comparison | string | number | null): boolean => {
  if (patternValue && isComparison(patternValue)) {
    // Handle different comparison operations.
    return handleComparison(dataValue, patternValue)
  } else {
    // Direct equality check for primitives and support for checking null values & arrays
    return (
      dataValue === patternValue ||
      (Array.isArray(dataValue) && dataValue.some((o) => o === patternValue))
    )
  }
}

// Function to handle various comparison types.
const handleComparison = (dataValue: DataValue, patternValue: Comparison): boolean => {
  if ('equals-ignore-case' in patternValue) {
    return (
      typeof dataValue === 'string' && dataValue.toLowerCase() === patternValue['equals-ignore-case'].toLowerCase()
    )
  } else if ('anything-but' in patternValue) {
    return !patternValue['anything-but'].includes(dataValue as string | number)
  } else if ('numeric' in patternValue) {
    return handleNumericComparison(dataValue, patternValue.numeric)
  } else if ('exists' in patternValue) {
    return patternValue.exists === (dataValue !== undefined)
  } else if ('prefix' in patternValue) {
    return typeof dataValue === 'string' && dataValue.startsWith(patternValue.prefix)
  } else if ('suffix' in patternValue) {
    return typeof dataValue === 'string' && dataValue.endsWith(patternValue.suffix)
  } else if ('wildcard' in patternValue) {
    return typeof dataValue === 'string' && handleWildcardComparison(dataValue, patternValue.wildcard)
  }

  // If no known comparison type is found, return false.
  return false
}
