import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

// On Vercel: use /tmp (writable temp dir). Locally: use project folder.
// Fallback: If sqlite3 fails (binary issue on Vercel), use a simple In-Memory Mock mode
let sequelize: any;

try {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false
    });
  } else {
    const dbPath = process.env.VERCEL === '1'
      ? '/tmp/test_planner.sqlite'
      : path.join(process.cwd(), 'backend', 'test_planner.sqlite');

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: false
    });
  }
} catch (e) {
  console.error("Critical: SQLite3 failed to load. Falling back to In-Memory for Vercel stability.", e);
  // Fail-safe: Use in-memory SQLite (if even that fails, we'll need a mock object but this should work)
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
}

export class JiraConnection extends Model {
  declare id: number;
  declare connection_name: string;
  declare host: string;
  declare email: string;
  declare api_token: string;
}

JiraConnection.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  connection_name: { type: DataTypes.STRING, unique: true },
  host: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  api_token: { type: DataTypes.STRING }
}, { sequelize, tableName: 'jira_connections' });

export class LLMConnection extends Model {
  declare id: number;
  declare provider: string;
  declare model: string;
  declare api_key: string;
  declare base_url: string;
  declare is_active: number;
}

LLMConnection.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  provider: { type: DataTypes.STRING },
  model: { type: DataTypes.STRING },
  api_key: { type: DataTypes.STRING, allowNull: true },
  base_url: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { sequelize, tableName: 'llm_connections' });

export class TestPlanHistory extends Model {
  declare id: number;
  declare project_key: string;
  declare issues_used: string;
  declare plan_json: string;
  declare createdAt: Date;
}

TestPlanHistory.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_key: { type: DataTypes.STRING },
  issues_used: { type: DataTypes.TEXT },
  plan_json: { type: DataTypes.TEXT }
}, { sequelize, tableName: 'test_plans' });

export const initDb = async () => {
  await sequelize.sync();
};
