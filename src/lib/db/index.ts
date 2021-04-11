import { SQLClient } from 'lib/db/abstract'

import { MySQLClient } from './_mysql'

export const sqlClientFactory = (
    type: string,
    { host, username, password, database },
): SQLClient => {
    const client = {
        mysql: MySQLClient,
    }[type]
    return new client({ host, username, password, database })
}
