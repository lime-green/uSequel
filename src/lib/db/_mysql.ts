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
    ): Promise<Record<string, any>[]> => {
        const query = `select * from ${table} limit ${limit}`
        console.debug('Making query:', query)

        return this.sendDriver(this.connection.driver.query, query).then(
            ([results]) => {
                return results.map((row) => ({ ...row }))
            },
        )
    }
}
