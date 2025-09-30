import { stringify } from "csv-stringify/sync"

type CsvRow = Record<string, string | number | boolean | null | undefined>

type CsvOptions = {
  columns?: string[]
}

export function buildCsv(rows: CsvRow[], options: CsvOptions = {}) {
  const columns = options.columns ?? Object.keys(rows[0] ?? {})
  return stringify(rows, {
    header: true,
    columns,
  })
}



