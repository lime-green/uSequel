export class Connection {
    driver: any

    constructor(driver: any) {
        this.driver = driver
    }
}

export abstract class SQLClient {
    protected connection: Connection
    abstract connect(): Promise<SQLClient>
    abstract close(): Promise<void>
    abstract listDatabases(): Promise<string[]>
    abstract listTables(): Promise<string[]>
    abstract fetchTableRows(
        table: string,
        limit: number,
    ): Promise<Record<string, any>[]>
}
