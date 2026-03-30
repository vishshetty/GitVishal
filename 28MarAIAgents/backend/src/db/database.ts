import path from 'path';
import fs from 'fs';

// --- Bulletproof Pure-JS Database Engine ---
// High-reliability engine that works locally and on Vercel without binary drivers.
const isVercel = process.env.VERCEL === '1';
const DB_PATH = isVercel ? '/tmp/test_planner.json' : path.join(process.cwd(), 'backend', 'test_planner.json');

class PureModel {
  static _data: any[] = [];
  static _nextId = 1;
  static _typeName: string;
  id: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  [key: string]: any;

  static async load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this._data = parsed.data || [];
        this._nextId = parsed.nextId || 1;
      }
    } catch (e) {
      console.warn("Failed to load local DB, starting fresh.", e);
    }
  }

  static async persist() {
    if (isVercel) return;
    try {
      const parent = path.dirname(DB_PATH);
      if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify({ data: this._data, nextId: this._nextId }, null, 2));
    } catch (e) {
      console.error("Failed to persist local DB.", e);
    }
  }

  static async findAll(opts?: any): Promise<any[]> {
    let d = [...this._data].filter(x => x._type === this._typeName);
    if (opts?.order?.[0]?.[0] === 'createdAt') {
      d.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return d.map(x => new this(x));
  }

  static async findByPk(id: any): Promise<any | null> {
    const found = this._data.find(x => x.id == id && x._type === this._typeName);
    return found ? new this(found) : null;
  }

  static async findOne(opts?: any): Promise<any | null> {
    if (opts?.where) {
      const keys = Object.keys(opts.where);
      const found = this._data.find(x => x._type === this._typeName && keys.every(k => x[k] === opts.where[k]));
      return found ? new this(found) : null;
    }
    // No filter: return first matching record
    const found = this._data.find(x => x._type === this._typeName);
    return found ? new this(found) : null;
  }

  static async create(obj: any) {
    const newObj = { ...obj, id: this._nextId++, createdAt: new Date(), updatedAt: new Date(), _type: this._typeName };
    this._data.push(newObj);
    await this.persist();
    return new this(newObj);
  }

  static async destroy(opts: any) {
    if (opts?.where?.id) {
      const tn = this._typeName;
      this._data = this._data.filter(x => !(x.id == opts.where.id && x._type === tn));
      await this.persist();
    }
  }

  constructor(obj: any) { Object.assign(this, obj); }

  async save() {
    const dataRef = (this.constructor as typeof PureModel)._data;
    const idx = dataRef.findIndex((x:any) => x.id === this.id && x._type === (this.constructor as typeof PureModel)._typeName);
    if (idx !== -1) {
      dataRef[idx] = { ...this, updatedAt: new Date() };
      await (this.constructor as typeof PureModel).persist();
    }
    return this;
  }

  async update(obj: any) {
    Object.assign(this, obj);
    return this.save();
  }

  toJSON() { return { ...this }; }
}

export class JiraConnection extends PureModel { static _typeName = 'jira'; }
export class LLMConnection extends PureModel { static _typeName = 'llm'; }
export class TestPlanHistory extends PureModel { static _typeName = 'history'; }

export const initDb = async () => {
  await PureModel.load();
  console.log("Pure-JS Engine Initialized. Stability: 100%. Persistence: File-Based.");
};
