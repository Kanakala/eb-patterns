// Type Definitions for various comparison operations possible in a pattern.
type Comparison =
  | { 'equals-ignore-case': string }
  | { 'anything-but': Array<string | number | boolean> }
  | { numeric: Array<string | number> }
  | { exists: boolean }
  | { prefix: string }
  | { suffix: string }
  | { wildcard: string }

// A PatternValue might be an array of comparisons or nested patterns.
type PatternValue = Array<Comparison | string | number | boolean | null> | Pattern

// Pattern defines a recursive structure for patterns in the event pattern.
interface Pattern {
  [key: string]: PatternValue | { $or: Pattern[] }
}

// DataValue types that can be present in the actual event data.
type DataValue = string | number | boolean | null | Data | DataArray

// An array of DataValues to represent lists in event data.
type DataArray = DataValue[]

// Data represents the structure of the event data.
interface Data { [key: string]: DataValue }

export { Comparison, PatternValue, Pattern, Data, DataArray, DataValue }
