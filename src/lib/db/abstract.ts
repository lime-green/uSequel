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
        orderByColumn: string | null,
        orderByType: 'asc' | 'desc' | null,
        offset: number,
    ): Promise<Record<string, any>[]>
    abstract fetchCount(table: string): Promise<number>
    abstract getColumnInfo(table: string): Promise<Record<string, any>[]>
    abstract searchTables(lookup: string): Promise<string[]>
}
