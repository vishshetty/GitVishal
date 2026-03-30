import path from 'path';

// --- The Ultimate Vercel Shield ---
// Ensuring zero binary dependencies in serverless mode.
const isVercel = process.env.VERCEL === '1';

// Base Virtual Model for pure JS mode
class VirtualModel {
  static _data: any[] = [];
  static _nextId = 1;
  id: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  static async findAll(opts?: any) {
    let d = [...this._data];
    if (opts?.order?.[0]?.[0] === 'createdAt') {
      d.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return d.map(x => new this(x));
  }

  static async findByPk(id: any) {
    const found = this._data.find(x => x.id == id);
    return found ? new this(found) : null;
  }

  static async findOne(opts: any) {
    if (opts?.where) {
      const keys = Object.keys(opts.where);
      const found = this._data.find(x => keys.every(k => x[k] === opts.where[k]));
      return found ? new this(found) : null;
    }
    return null;
  }

  static async create(obj: any) {
    const newObj = { ...obj, id: this._nextId++, createdAt: new Date(), updatedAt: new Date() };
    this._data.push(newObj);
    return new this(newObj);
  }

  static async destroy(opts: any) {
    if (opts?.where?.id) {
      this._data = this._data.filter(x => x.id != opts.where.id);
    }
  }

  constructor(obj: any) { Object.assign(this, obj); }
  
  async save() {
    const dataRef = (this.constructor as any)._data;
    const idx = dataRef.findIndex((x:any) => x.id === this.id);
    if (idx !== -1) {
      dataRef[idx] = { ...this, updatedAt: new Date() };
    }
    return this;
  }

  async update(obj: any) {
    Object.assign(this, obj);
    return this.save();
  }

  toJSON() { return { ...this }; }
}

// Dynamically determine the Base Model to use.
// We only import Sequelize if we aren't on Vercel to avoid binary driver crashes.
let Base: any = VirtualModel;
let DataTypes: any = {};
let sequelizeInstance: any = null;

if (!isVercel) {
  try {
    const sq = require('sequelize');
    Base = sq.Model;
    DataTypes = sq.DataTypes;
    sequelizeInstance = new sq.Sequelize({
      dialect: 'sqlite',
      storage: path.join(process.cwd(), 'backend', 'test_planner.sqlite'),
      logging: false
    });
  } catch (e) {
    console.warn("Falling back to Virtual DB locally due to missing sqlite3 driver.");
    Base = VirtualModel;
  }
}

export class JiraConnection extends Base {}
export class LLMConnection extends Base {}
export class TestPlanHistory extends Base {}

export const initDb = async () => {
  if (Base === VirtualModel || !sequelizeInstance) {
    console.log("Vercel Shield Active: Running in Pure JS Mode.");
    return;
  }

  JiraConnection.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    connection_name: { type: DataTypes.STRING, unique: true },
    host: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    api_token: { type: DataTypes.STRING }
  }, { sequelize: sequelizeInstance, tableName: 'jira_connections' });

  LLMConnection.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    provider: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    api_key: { type: DataTypes.STRING, allowNull: true },
    base_url: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, { sequelize: sequelizeInstance, tableName: 'llm_connections' });

  TestPlanHistory.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    project_key: { type: DataTypes.STRING },
    issues_used: { type: DataTypes.TEXT },
    plan_json: { type: DataTypes.TEXT }
  }, { sequelize: sequelizeInstance, tableName: 'test_plans' });

  await sequelizeInstance.sync();
};
