import mysql from 'mysql'

import { promisify } from 'lib/util'

import { Connection, SQLClient } from './abstract'

export class MySQLClient extends SQLClient {
    protected connection: { driver: mysql.Connection }

    constructor({ host, database, username, password }) {
        super()
        this.connection = new Connection(
            mysql.createConnection({
                host,
                database,
                user: username,
                password,
                dateStrings: true,
                stringifyObjects: true,
            }),
        )
    }

    protected sendDriver = (fn, ...args): Promise<any> => {
        return promisify(fn.bind(this.connection.driver), ...args)
    }

    connect = (): Promise<SQLClient> => {
        console.log('starting connection')

        return this.sendDriver(this.connection.driver.connect).then(() => this)
    }

    close = (): Promise<void> => {
        console.log('closing connection')

        return this.sendDriver(this.connection.driver.end)
    }

    listDatabases = (): Promise<string[]> => {
        return this.sendDriver(
            this.connection.driver.query,
            'show databases',
        ).then(([results]) => {
            return results.map((row) => row.Database)
        })
    }

    listTables = (): Promise<string[]> => {
        return this.sendDriver(
            this.connection.driver.query,
            'show tables',
        ).then(([results]) => {
            return results.map((row) => row.Tables_in_mysql)
        })
    }

    fetchTableRows = (
        table: string,
        limit: number,
        orderByColumn: string | null = null,
        orderByType: 'asc' | 'desc' | null = null,
        offset = 0,
    ): Promise<Record<string, any>[]> => {
        let query = `select * from ${table}`
        if (orderByColumn && orderByType)
            query += ` order by ${orderByColumn} ${orderByType}`
        if (limit) query += ` limit ${limit}`
        if (offset) query += ` offset ${offset}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                const decoder = new TextDecoder('utf-8', {
                    fatal: true,
                })
                const normalizeRow = (row) => {
                    const normalizedRow = { ...row }
                    Object.entries(normalizedRow).forEach(([k, v]) => {
                        if (v instanceof Buffer) {
                            try {
                                normalizedRow[k] = decoder.decode(v)
                            } catch {
                                normalizedRow[k] = `0x${v.toString('hex')}`
                            }
                        }
                    })
                    return normalizedRow
                }
                return results.map((row) => normalizeRow(row))
            },
        )
    }

    fetchCount = (table: string): Promise<number> => {
        const query = `select count(1) from ${table}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                return Number(Object.values(results[0])[0])
            },
        )
    }

    getColumnInfo = (table: string): Promise<Record<string, any>[]> => {
        const query = `show columns from ${table}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                return results
                    .map((row) => ({ ...row }))
                    .reduce(
                        (agg, column) => [
                            ...agg,
                            {
                                name: column.Field,
                                type: column.Type,
                                isNull: column.Null === 'YES',
                                isPrimary: column.Key === 'PRI',
                                isUnique: column.Key === 'UNI',
                                default: column.Default,
                            },
                        ],
                        [],
                    )
            },
        )
    }

    searchTables = (lookup: string): Promise<string[]> => {
        const query = `show tables like '%${lookup}%'`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                console.log(results)
                return results.map((row) => row.Tables_in_mysql)
            },
        )
    }
}
