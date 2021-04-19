import mysql from 'mysql'

import { promisify } from 'lib/util'

import { ColumnInfo, Connection, SQLClient, UpdateResult } from './abstract'

export class MySQLClient extends SQLClient {
    protected connection: { driver: mysql.Connection }

    constructor({ host, database, username, password, port }) {
        super()
        this.connection = new Connection(
            mysql.createConnection({
                host,
                database,
                user: username,
                password,
                port,
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
            return results.map((row) => Object.values(row)[0])
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
                    const normalizedRow = Object.values(row)
                    return normalizedRow.map((v) => {
                        if (v instanceof Buffer) {
                            try {
                                return decoder.decode(v)
                            } catch {
                                return `0x${v.toString('hex')}`
                            }
                        }
                        return v
                    })
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

    getColumnInfo = (table: string): Promise<ColumnInfo[]> => {
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

    update = (
        table: string,
        set: Record<string, any>,
        where: Record<string, any>,
    ): Promise<UpdateResult> => {
        const setQuery = Object.entries(set).reduce(
            (agg, [k, v]) => (agg ? `${agg}, ${k} = '${v}'` : `${k} = '${v}'`),
            '',
        )
        const whereQuery = Object.entries(where).reduce(
            (agg, [k, v]) =>
                agg ? `${agg} and ${k} = '${v}'` : `${k} = '${v}'`,
            '',
        )

        const query = `update ${table} set ${setQuery} where ${whereQuery}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                return {
                    affectedCount: results.affectedRows,
                    changedCount: results.changedRows,
                }
            },
        )
    }

    selectDatabase = (database: string): Promise<void> => {
        const query = `use ${database}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query)
    }
}
