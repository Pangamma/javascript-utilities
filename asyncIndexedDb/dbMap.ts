const C_DB_NAME = "dbMap";
const C_DB_VERS = 1;

class DbMapUtil {
    public static promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            req.onerror = (ev: Event) => reject(ev);
            req.onsuccess = function (this: IDBRequest<T>, ev: Event) { resolve(this.result); }
        });
    }
    public static promisifyTransaction(req: IDBTransaction): Promise<IDBTransaction> {
        return new Promise<IDBTransaction>((resolve, reject) => {
            req.onerror = (ev: Event) => reject(ev);
            req.onabort = (ev: Event) => reject(ev);
            req.oncomplete = function (this: IDBTransaction, ev: Event) { resolve(this); }
        });
    }
}

class DbMap {
    private isInitialized = false;
    private dbRef?: IDBDatabase = undefined;
    private dbTable: string;

    private constructor(table: string) {
        this.dbTable = table;
    }

    public static tables: Record<string, DbMap> = {};
    public static async getTableAsync(tableName: string) {
        if (!DbMap.tables[tableName]) {
            const map = new DbMap(tableName);
            DbMap.tables[tableName] = map;
        }

        return DbMap.tables[tableName];
    }


    private getDbAsync() {
        const zelf = this;
        if (this.dbRef !== undefined) {
            return Promise.resolve(this.dbRef!);
        }
        return new Promise<IDBDatabase>((resolve, reject) => {
            const opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
            const failFunc = () => { console.error(`Failed to open ${C_DB_NAME} db.`); reject(false); }
            opReq.onerror = failFunc;
            opReq.onblocked = failFunc;
            opReq.onsuccess = function (this: IDBRequest<IDBDatabase>, ev: Event) {
                zelf.isInitialized = true;
                zelf.dbRef = opReq.result;
                resolve(zelf.dbRef);
            }
        });
    }

    private initSchemaAsync = async () => new Promise<boolean>(async (resolve, reject) => {
        console.log(`Initializing ${C_DB_NAME} v${C_DB_VERS} schema.`);
        const opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
        const failFunc = () => { console.error(`Failed to init ${C_DB_NAME} schema.`); reject(false); }
        opReq.onerror = failFunc;
        opReq.onblocked = failFunc;
        const zelf = this;
        opReq.onupgradeneeded = function (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
            console.log("db upgrade", { zelf: this, ev });
            const db = this.result;
            const tableEntries = db.createObjectStore(zelf.dbTable);
        };
        opReq.onsuccess = function (this: IDBRequest<IDBDatabase>, ev: Event) {
            zelf.isInitialized = true;
            zelf.dbRef = opReq.result;
            resolve(true);
        }
    });

    public async clearAsync<V>() {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readwrite");
        const store = scope.objectStore(this.dbTable);
        store.clear();
        await DbMapUtil.promisifyTransaction(scope);
    }

    public async putAsync<V>(key: string, value: V) {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readwrite");
        const store = scope.objectStore(this.dbTable);
        store.put(value, key);
        await DbMapUtil.promisifyTransaction(scope);
    }

    public async getAsync<V>(key: IDBValidKey | IDBKeyRange) {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readonly");
        const store = scope.objectStore(this.dbTable);
        const req = store.get(key); 
        await DbMapUtil.promisifyTransaction(scope);
        return req.result as V;
    }   
    
    public async getCountAsync() {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readonly");
        const store = scope.objectStore(this.dbTable);
        const req = store.count(this.dbTable);
        await DbMapUtil.promisifyTransaction(scope);
        return req.result;
    }

    public async deleteAsync(key: string) {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readwrite");
        const store = scope.objectStore(this.dbTable);
        const req = store.delete(key);
        await DbMapUtil.promisifyTransaction(scope);
    }

    public async listKeysAsync() {
        const db = await this.getDbAsync();
        const scope = db.transaction(this.dbTable, "readonly");
        const store = scope.objectStore(this.dbTable);
        const req = store.getAllKeys();
        await DbMapUtil.promisifyTransaction(scope);
        return req.result;
    }
}

const initFunc = async () => {
    const dbs = { 
        fresh: (await DbMap.getTableAsync('fresh')),
        cache: (await DbMap.getTableAsync('cache')),
        yeet: (await DbMap.getTableAsync('yeet'))
    };

    (window as any).dbs = dbs;
    return dbs;
};