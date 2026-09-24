"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.persistDatabase = persistDatabase;
exports.execSql = execSql;
exports.queryRows = queryRows;
exports.queryRow = queryRow;
exports.runQuery = runQuery;
const sql_js_1 = __importDefault(require("sql.js"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let dbInstance = null;
const dbDir = path.resolve(__dirname, '../../../database');
const dbPath = path.join(dbDir, 'heatguard.sqlite');
async function getDatabase() {
    if (dbInstance)
        return dbInstance;
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    const SQL = await (0, sql_js_1.default)();
    if (fs.existsSync(dbPath)) {
        const filebuffer = fs.readFileSync(dbPath);
        dbInstance = new SQL.Database(filebuffer);
    }
    else {
        dbInstance = new SQL.Database();
        persistDatabase(dbInstance);
    }
    return dbInstance;
}
function persistDatabase(db) {
    const targetDb = db || dbInstance;
    if (!targetDb)
        return;
    try {
        const data = targetDb.export();
        const buffer = Buffer.from(data);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        fs.writeFileSync(dbPath, buffer);
    }
    catch (err) {
        console.error('Failed to persist SQLite database to disk:', err);
    }
}
/**
 * Execute raw SQL commands (DDL/DML)
 */
async function execSql(sql) {
    const db = await getDatabase();
    db.exec(sql);
    persistDatabase(db);
}
/**
 * Run a parameterized query returning all rows as objects
 */
async function queryRows(sql, params = []) {
    const db = await getDatabase();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}
/**
 * Run a parameterized query returning a single row as object
 */
async function queryRow(sql, params = []) {
    const rows = await queryRows(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
/**
 * Run an INSERT/UPDATE/DELETE query and persist
 */
async function runQuery(sql, params = []) {
    const db = await getDatabase();
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    persistDatabase(db);
}
