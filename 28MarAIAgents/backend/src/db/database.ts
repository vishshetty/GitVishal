import path from 'path';

// --- Hybrid Database Engine ---
// If on Vercel, use a Pure JS Virtual DB to bypass sqlite3 binary issues.
const isVercel = process.env.VERCEL === '1';

class VirtualModel {
  static data: any[] = [];
  static nextId = 1;
  id: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  static async findAll(opts?: any) {
    let d = [...this.data];
    if (opts?.order?.[0]?.[0] === 'createdAt') {
      d.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return d.map(x => new this(x));
  }

  static async findByPk(id: any) {
    const found = this.data.find(x => x.id == id);
    return found ? new this(found) : null;
  }

  static async findOne(opts: any) {
    if (opts.where) {
      const keys = Object.keys(opts.where);
      const found = this.data.find(x => keys.every(k => x[k] === opts.where[k]));
      return found ? new this(found) : null;
    }
    return null;
  }

  static async create(obj: any) {
    const newObj = { ...obj, id: this.nextId++, createdAt: new Date(), updatedAt: new Date() };
    this.data.push(newObj);
    return new this(newObj);
  }

  static async destroy(opts: any) {
    if (opts.where?.id) {
      this.data = this.data.filter(x => x.id != opts.where.id);
    }
  }

  constructor(obj: any) { Object.assign(this, obj); }
  
  async save() {
    const idx = (this.constructor as any).data.findIndex((x: any) => x.id === this.id);
    if (idx !== -1) {
      (this.constructor as any).data[idx] = { ...this, updatedAt: new Date() };
    }
    return this;
  }

  async update(obj: any) {
    Object.assign(this, obj);
    return this.save();
  }

  toJSON() { return { ...this }; }
}

// Global state to hold Sequelized models (if not Vercel)
let Models: any = {};

if (!isVercel) {
  const { Sequelize, DataTypes, Model } = require('sequelize');
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'backend', 'test_planner.sqlite'),
    logging: false
  });

  const JiraConnection = class extends Model {};
  JiraConnection.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    connection_name: { type: DataTypes.STRING, unique: true },
    host: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    api_token: { type: DataTypes.STRING }
  }, { sequelize, tableName: 'jira_connections' });

  const LLMConnection = class extends Model {};
  LLMConnection.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    provider: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    api_key: { type: DataTypes.STRING, allowNull: true },
    base_url: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, { sequelize, tableName: 'llm_connections' });

  const TestPlanHistory = class extends Model {};
  TestPlanHistory.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    project_key: { type: DataTypes.STRING },
    issues_used: { type: DataTypes.TEXT },
    plan_json: { type: DataTypes.TEXT }
  }, { sequelize, tableName: 'test_plans' });

  Models = { JiraConnection, LLMConnection, TestPlanHistory, sequelize };
} else {
  // Use Virtual Models for Vercel
  Models = {
    JiraConnection: class extends VirtualModel {},
    LLMConnection: class extends VirtualModel {},
    TestPlanHistory: class extends VirtualModel {},
    sequelize: { sync: async () => {} }
  };
}

export const JiraConnection = Models.JiraConnection;
export const LLMConnection = Models.LLMConnection;
export const TestPlanHistory = Models.TestPlanHistory;

export const initDb = async () => {
  if (Models.sequelize.sync) {
    await Models.sequelize.sync();
  }
};
