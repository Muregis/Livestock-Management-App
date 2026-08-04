# MySQL Configuration Example

## Environment Variables (.env)

```bash
# MySQL Connection
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=livestock_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=livestock_management

# Supabase fallback (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Usage Examples

### Using MySQL (Server-side)
```typescript
import { createMySQLConnection, getAnimalService } from '@/lib/mysqlService';

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'livestock_db'
};

const db = createMySQLConnection(config);
await db.connect();

const animalService = getAnimalService(db);
const animals = await animalService.getAll();

// Close when done
await db.close();
```

### Using Supabase (Client-side)
```typescript
import { AnimalService } from '@/lib/livestockService';

// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
const animals = await AnimalService.getAll();
```

### Hybrid Approach (Recommended)
```typescript
import { getEnvironment } from '@/lib/config';
import { MySqlDatabase, getAnimalService } from '@/lib/mysqlService';
import { AnimalService } from '@/lib/livestockService';

const env = getEnvironment();

if (env.database === 'mysql') {
  const db = new MySqlDatabase({
    host: process.env.MYSQL_HOST!,
    port: parseInt(process.env.MYSQL_PORT!),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!
  });
  await db.connect();
  const animalService = getAnimalService(db);
  // Use MySQL
} else {
  // Use Supabase
  const animals = await AnimalService.getAll();
}
```

## Configuration File

Create `src/lib/config.ts`:

```typescript
export type DatabaseType = 'supabase' | 'mysql';

export interface AppConfig {
  database: DatabaseType;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  mysql?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

export function getEnvironment(): AppConfig {
  const database = (import.meta.env.VITE_DATABASE_TYPE || 'supabase') as DatabaseType;
  
  if (database === 'mysql') {
    return {
      database: 'mysql',
      mysql: {
        host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
        port: parseInt(import.meta.env.VITE_MYSQL_PORT || '3306'),
        user: import.meta.env.VITE_MYSQL_USER || 'root',
        password: import.meta.env.VITE_MYSQL_PASSWORD || '',
        database: import.meta.env.VITE_MYSQL_DATABASE || 'livestock'
      }
    };
  }
  
  return {
    database: 'supabase',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
}
```

## MySQL npm Dependencies

Add to package.json:

```json
{
  "dependencies": {
    "mysql2": "^3.9.0"
  },
  "devDependencies": {
    "@types/mysql2": "^3.0.0"
  }
}
```