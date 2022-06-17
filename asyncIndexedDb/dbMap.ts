const C_DB_NAME = "dbMap";
const C_DB_VERS = 1;
const C_DB_STORE = "entries";

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
    private static isInitialized = false;
    private static dbRef?: IDBDatabase = undefined;
    public static getDbAsync() {
        if (this.dbRef !== undefined) {
            return Promise.resolve(this.dbRef!);
        }
        return new Promise<IDBDatabase>((resolve, reject) => {
            const opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
            const failFunc = () => { console.error(`Failed to open ${C_DB_NAME} db.`); reject(false); }
            opReq.onerror = failFunc;
            opReq.onblocked = failFunc;
            opReq.onsuccess = function (this: IDBRequest<IDBDatabase>, ev: Event) {
                DbMap.isInitialized = true;
                DbMap.dbRef = opReq.result;
                resolve(DbMap.dbRef);
            }
        });
    }

    public static resetSchemaAsync = async (clearCache: boolean = false) => {
        if (!clearCache && this.isInitialized) {
            return;
        }

        const isInit = await DbMap.isSchemaInitializedAsync();
        if (isInit) {
            await DbMap.clearSchemaAsync();
        }

        const isSuccess = await DbMap.initSchemaAsync();
    }

    private static isSchemaInitializedAsync = async () => {
        let dbs = await window.indexedDB.databases();
        return dbs.filter(x => x.name === C_DB_NAME).length > 0;
    }

    private static clearSchemaAsync = async () => new Promise<void>(async (resolve, reject) => {
        DbMap.isInitialized = false;
        DbMap.dbRef = undefined;
        let dbs = await window.indexedDB.databases();
        let found = dbs.filter(x => x.name === C_DB_NAME).length > 0;

        if (!found) {
            resolve();
            return;
        }

        const task = window.indexedDB.deleteDatabase(C_DB_NAME);
        task.onsuccess = () => resolve();
        task.onerror = () => reject();
        task.onblocked = () => reject();
    });

    private static initSchemaAsync = async () => new Promise<boolean>(async (resolve, reject) => {
        console.log(`Initializing ${C_DB_NAME} v${C_DB_VERS} schema.`);
        const opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
        const failFunc = () => { console.error(`Failed to init ${C_DB_NAME} schema.`); reject(false); }
        opReq.onerror = failFunc;
        opReq.onblocked = failFunc;
        opReq.onupgradeneeded = function (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
            console.log("db upgrade", { zelf: this, ev });
            const db = this.result;
            const tableEntries = db.createObjectStore("entries");
            // tableEntries.createIndex("EXPIRE_TIME", "forceExpireAt", { unique: false });
            // tableEntries.createIndex("LAST_USED", "lastUsed", { unique: false });
        };
        opReq.onsuccess = function (this: IDBRequest<IDBDatabase>, ev: Event) {
            DbMap.isInitialized = true;
            DbMap.dbRef = opReq.result;
            resolve(true);
        }
    });

    public static async clearAsync<V>() {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readwrite");
        const store = scope.objectStore(C_DB_STORE);
        store.clear();
        await DbMapUtil.promisifyTransaction(scope);
    }

    public static async putAsync<V>(key: string, value: V) {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readwrite");
        const store = scope.objectStore(C_DB_STORE);
        store.put(value, key);
        await DbMapUtil.promisifyTransaction(scope);
    }

    public static async getAsync<V>(key: string) {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readonly");
        const store = scope.objectStore(C_DB_STORE);
        const req = store.get(key); 
        await DbMapUtil.promisifyTransaction(scope);
        return req.result as V;
    }   
    
    public static async getCountAsync() {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readonly");
        const store = scope.objectStore(C_DB_STORE);
        const req = store.count(C_DB_STORE);
        await DbMapUtil.promisifyTransaction(scope);
        return req.result;
    }

    public static async deleteAsync(key: string) {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readonly");
        const store = scope.objectStore(C_DB_STORE);
        const req = store.delete(key);
        await DbMapUtil.promisifyTransaction(scope);
    }

    public static async listKeysAsync() {
        const db = await DbMap.getDbAsync();
        const scope = db.transaction(C_DB_STORE, "readonly");
        const store = scope.objectStore(C_DB_STORE);
        const req = store.getAllKeys();
        await DbMapUtil.promisifyTransaction(scope);
        return req.result;
    }
}