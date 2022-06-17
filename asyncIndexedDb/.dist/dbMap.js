var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var C_DB_NAME = "dbMap";
var C_DB_VERS = 1;
var C_DB_STORE = "entries";
var DbMapUtil = /** @class */ (function () {
    function DbMapUtil() {
    }
    DbMapUtil.promisifyRequest = function (req) {
        return new Promise(function (resolve, reject) {
            req.onerror = function (ev) { return reject(ev); };
            req.onsuccess = function (ev) { resolve(this.result); };
        });
    };
    DbMapUtil.promisifyTransaction = function (req) {
        return new Promise(function (resolve, reject) {
            req.onerror = function (ev) { return reject(ev); };
            req.onabort = function (ev) { return reject(ev); };
            req.oncomplete = function (ev) { resolve(this); };
        });
    };
    return DbMapUtil;
}());
var DbMap = /** @class */ (function () {
    function DbMap() {
    }
    DbMap.getDbAsync = function () {
        if (this.dbRef !== undefined) {
            return Promise.resolve(this.dbRef);
        }
        return new Promise(function (resolve, reject) {
            var opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
            var failFunc = function () { console.error("Failed to open ".concat(C_DB_NAME, " db.")); reject(false); };
            opReq.onerror = failFunc;
            opReq.onblocked = failFunc;
            opReq.onsuccess = function (ev) {
                DbMap.isInitialized = true;
                DbMap.dbRef = opReq.result;
                resolve(DbMap.dbRef);
            };
        });
    };
    DbMap.clearAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readwrite");
                        store = scope.objectStore(C_DB_STORE);
                        store.clear();
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbMap.putAsync = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readwrite");
                        store = scope.objectStore(C_DB_STORE);
                        store.put(value, key);
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbMap.getAsync = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store, req;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readonly");
                        store = scope.objectStore(C_DB_STORE);
                        req = store.get(key);
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, req.result];
                }
            });
        });
    };
    DbMap.getCountAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store, req;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readonly");
                        store = scope.objectStore(C_DB_STORE);
                        req = store.count(C_DB_STORE);
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, req.result];
                }
            });
        });
    };
    DbMap.deleteAsync = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store, req;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readonly");
                        store = scope.objectStore(C_DB_STORE);
                        req = store["delete"](key);
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbMap.listKeysAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, scope, store, req;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DbMap.getDbAsync()];
                    case 1:
                        db = _b.sent();
                        scope = db.transaction(C_DB_STORE, "readonly");
                        store = scope.objectStore(C_DB_STORE);
                        req = store.getAllKeys();
                        return [4 /*yield*/, DbMapUtil.promisifyTransaction(scope)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, req.result];
                }
            });
        });
    };
    var _a;
    _a = DbMap;
    DbMap.isInitialized = false;
    DbMap.dbRef = undefined;
    DbMap.resetSchemaAsync = function (clearCache) {
        if (clearCache === void 0) { clearCache = false; }
        return __awaiter(_a, void 0, void 0, function () {
            var isInit, isSuccess;
            return __generator(_a, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!clearCache && this.isInitialized) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, DbMap.isSchemaInitializedAsync()];
                    case 1:
                        isInit = _b.sent();
                        if (!isInit) return [3 /*break*/, 3];
                        return [4 /*yield*/, DbMap.clearSchemaAsync()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, DbMap.initSchemaAsync()];
                    case 4:
                        isSuccess = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbMap.isSchemaInitializedAsync = function () { return __awaiter(_a, void 0, void 0, function () {
        var dbs;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, window.indexedDB.databases()];
                case 1:
                    dbs = _b.sent();
                    return [2 /*return*/, dbs.filter(function (x) { return x.name === C_DB_NAME; }).length > 0];
            }
        });
    }); };
    DbMap.clearSchemaAsync = function () { return __awaiter(_a, void 0, void 0, function () {
        var _this = _a;
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var dbs, found, task;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                DbMap.isInitialized = false;
                                DbMap.dbRef = undefined;
                                return [4 /*yield*/, window.indexedDB.databases()];
                            case 1:
                                dbs = _b.sent();
                                found = dbs.filter(function (x) { return x.name === C_DB_NAME; }).length > 0;
                                if (!found) {
                                    resolve();
                                    return [2 /*return*/];
                                }
                                task = window.indexedDB.deleteDatabase(C_DB_NAME);
                                task.onsuccess = function () { return resolve(); };
                                task.onerror = function () { return reject(); };
                                task.onblocked = function () { return reject(); };
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    }); };
    DbMap.initSchemaAsync = function () { return __awaiter(_a, void 0, void 0, function () {
        var _this = _a;
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var opReq, failFunc;
                    return __generator(this, function (_b) {
                        console.log("Initializing ".concat(C_DB_NAME, " v").concat(C_DB_VERS, " schema."));
                        opReq = window.indexedDB.open(C_DB_NAME, C_DB_VERS);
                        failFunc = function () { console.error("Failed to init ".concat(C_DB_NAME, " schema.")); reject(false); };
                        opReq.onerror = failFunc;
                        opReq.onblocked = failFunc;
                        opReq.onupgradeneeded = function (ev) {
                            console.log("db upgrade", { zelf: this, ev: ev });
                            var db = this.result;
                            var tableEntries = db.createObjectStore("entries");
                            // tableEntries.createIndex("EXPIRE_TIME", "forceExpireAt", { unique: false });
                            // tableEntries.createIndex("LAST_USED", "lastUsed", { unique: false });
                        };
                        opReq.onsuccess = function (ev) {
                            DbMap.isInitialized = true;
                            DbMap.dbRef = opReq.result;
                            resolve(true);
                        };
                        return [2 /*return*/];
                    });
                }); })];
        });
    }); };
    return DbMap;
}());
