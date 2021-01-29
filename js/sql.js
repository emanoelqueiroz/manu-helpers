class SqlUtils {

    constructor(tableName) {
        this.tableName = tableName;
    }

    toSqlType = str => ({
        'number': 'int4',
        'double': 'float8',
        'string': 'varchar',
        'boolean': 'boolean',
    }[str.toLowerCase()])

    cleanTableName() {
        return this.tableName.replace(/-/g, '_');
    }

    keyNoId(key) {
        return key.replace('_id', '');
    }

    create(obj) {
        const primaryArr = [];
        const foreignArr = [];

        let sql = `CREATE TABLE public.${this.cleanTableName()} (\n\t`;

        primaryArr.push(`CONSTRAINT ${this.cleanTableName()}_pk PRIMARY KEY (id)`);
        sql += 'id serial NOT NULL';

        if (Object.keys(obj).length) {
            sql += ',\n\t' + Object.keys(obj).map(key => {
                if (typeof obj[key] === 'string')
                    return `${key} ${this.toSqlType(obj[key])} NULL`;

                const { type, notNull, primary, foreign, defaultValue } = obj[key];
                let str = `${key} ${this.toSqlType(type)}`;

                str += notNull ? ' NOT NULL' : ' NULL';

                if (typeof (defaultValue) !== 'undefined' && defaultValue !== null)
                    str += ` DEFAULT ${typeof defaultValue === 'string' ? `'${defaultValue}'` : defaultValue}`;

                if (primary)
                    primaryArr.push(`CONSTRAINT ${this.cleanTableName()}_pk PRIMARY KEY (${key})`);

                if (foreign)
                    foreignArr.push(`CONSTRAINT ${this.cleanTableName()}_${this.keyNoId(key)}_fk FOREIGN KEY (${key}) REFERENCES public.${this.keyNoId(key)}(id)`);

                return str;
            }).join(',\n\t');
        }

        sql += `,\n\tcreated_by int4 NULL,`;
        sql += `\n\tcreated_at timestamp NULL DEFAULT now(),`;
        sql += `\n\tupdated_by int4 NULL,`;
        sql += `\n\tupdated_at timestamp NULL`;

        if (primaryArr.length)
            sql += ', \n\t' + primaryArr.join(',\n\t');

        if (foreignArr.length)
            sql += ', \n\t' + foreignArr.join(',\n\t');

        return sql += `\n);`;
    }

    newColumn(obj) {
        const foreignArr = [];

        const sql = Object.keys(obj).map(key => {
            if (typeof obj[key] === 'string')
                return `ALTER TABLE public.${this.cleanTableName()} ADD ${key} ${this.toSqlType(obj[key])} NULL;`;

            const { type, notNull, primary, foreign, defaultValue } = obj[key];

            let str = `ALTER TABLE public.${this.cleanTableName()} ADD ${key} ${this.toSqlType(type)}`

            str += notNull ? ' NOT NULL' : ' NULL';

            if (typeof (defaultValue) !== 'undefined' && defaultValue !== null)
                str += ` DEFAULT ${typeof defaultValue === 'string' ? `'${defaultValue}'` : defaultValue}`;

            // TODO: primary

            if (foreign)
                foreignArr.push(`ALTER TABLE public.${this.cleanTableName()} ADD CONSTRAINT ${this.cleanTableName()}_${this.keyNoId(key)}_fk FOREIGN KEY (${key}) REFERENCES public.${this.keyNoId(key)}(id);`);

            return str + ';';
        });

        return [...sql, ...foreignArr].join('\n');
    }

    dropTable() {
        return `DROP TABLE public.${this.tableName};`;
    }

    dropColumn(obj) {
        const sql = Object.keys(obj)
            .map(key => `ALTER TABLE public.${this.cleanTableName()} DROP COLUMN ${key};`);

        return [...sql].join('\n');
    }

}