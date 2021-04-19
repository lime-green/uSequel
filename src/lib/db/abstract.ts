export class Connection {
    driver: any

    constructor(driver: any) {
        this.driver = driver
    }
}

export type UpdateResult = {
    affectedCount: number
    changedCount: number
}

export type ColumnInfo = {
    name: string
    type: string
    isNull: boolean
    isPrimary: boolean
    isUnique: boolean
    default: string | number | null
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
    abstract getColumnInfo(table: string): Promise<ColumnInfo[]>
    abstract update(
        table: string,
        set: Record<string, any>,
        where: Record<string, any>,
    ): Promise<UpdateResult>
    abstract selectDatabase(database: string): Promise<void>
}
