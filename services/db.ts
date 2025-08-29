// A WARNING:
// This file contains a database connection string with credentials.
// In a real-world production application, this is a MAJOR SECURITY RISK.
// Backend APIs should always be used to interact with a database, never directly from the client.
// This implementation is for demonstration purposes only, to fulfill the prompt's requirements
// within a client-side-only framework.

import { neon } from '@neondatabase/serverless';
import { 
    type User, type Project, type RabDocument, type PriceDatabaseItem, 
    type WorkItem, type LogEntry, type Post, type PermissionId
} from '../types';

const connectionString = 'postgresql://neondb_owner:npg_ZhCoMen1v9Rx@ep-twilight-pond-a1ybu7fd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(connectionString);

// --- INITIAL DATA (for first-time setup) ---
const allPermissions: PermissionId[] = [
    'bq:view', 'bq:create', 'bq:edit', 'bq:delete', 'bq:approve',
    'rab:view', 'rab:create', 'rab:edit', 'rab:delete', 'rab:approve',
    'proyek:view', 'proyek:create', 'proyek:edit', 'proyek:delete',
    'database:view', 'database:edit',
    'admin:access', 'admin:users', 'admin:data', 'admin:logs'
];
const initialUsers: User[] = [
  { id: 'usr-1', username: 'admin.utama', name: 'Admin Utama', email: 'admin@proyekku.com', role: 'Admin', lastLogin: '2024-07-20T10:00:00Z', status: 'Active', password: '12345', photoUrl: 'https://i.pravatar.cc/150?u=admin@proyekku.com', permissions: allPermissions, plant: ['ALL'] },
  { id: 'usr-2', username: 'bambang.obm', name: 'Bambang OBM', email: 'obm@proyekku.com', role: 'OBM', lastLogin: '2024-07-19T14:30:00Z', status: 'Active', password: 'password', photoUrl: 'https://i.pravatar.cc/150?u=obm@proyekku.com', permissions: ['proyek:view'], plant: ['Sunter'] },
  { id: 'usr-3', username: 'gatot.proyek', name: 'Gatot Proyek', email: 'gas.project@proyekku.com', role: 'GAS Project', lastLogin: '2024-07-18T09:00:00Z', status: 'Active', password: 'password', photoUrl: 'https://i.pravatar.cc/150?u=gas.project@proyekku.com', permissions: ['bq:view', 'bq:create', 'bq:edit', 'rab:view', 'rab:create', 'rab:edit', 'proyek:view', 'proyek:edit', 'database:view'], plant: ['Cikarang P3', 'Karawang P4'] },
];

const initialRabData: RabDocument[] = [
  { id: 'rab-init-1', eMPR: 'RAB001', projectName: 'Pembangunan Kantor Cabang Utama di Jakarta Selatan', pic: 'Andi', surveyDate: '2023-05-10', receivedDate: '2023-05-15', finishDate: '2024-01-10', status: 'Selesai', tenderValue: 1200000000, keterangan: 'Selesai lebih cepat dari jadwal.', sla: 0, pdfReady: true, creatorName: 'Admin', approverName: 'Manajer', workDuration: 180, isLocked: true,
    detailItems: [
      { id: 'cat-1', type: 'category', uraianPekerjaan: 'PEKERJAAN PERSIAPAN', volume: 0, satuan: '', hargaSatuan: 0, keterangan: '', isEditing: false, isSaved: true, itemNumber: 'I' },
      { id: 'item-1', type: 'item', uraianPekerjaan: 'Pembersihan Lokasi dan Pematokan', volume: 1, satuan: 'Ls', hargaSatuan: 5000000, keterangan: '', isEditing: false, isSaved: true, ahs: [{id: 'ahs-1', componentName: 'Mandor', quantity: 1, unit: 'HOK', unitPrice: 200000, category: 'Jasa Pekerja', source: 'db'}], itemNumber: '1' },
  ] },
];
const initialBqData: RabDocument[] = JSON.parse(JSON.stringify(initialRabData)).map((item: RabDocument, index: number) => ({...item, id: `bq-init-${index+1}`, eMPR: item.eMPR.replace('RAB', 'BQ')}));

const initialProjects: Project[] = [
    { id: 'proj-init-1', name: 'Website E-commerce Klien A', team: ['Andi', 'Budi', 'Citra'], status: 'In Progress', dueDate: '2024-09-30', progress: 75, group: 'Pengembangan IT', description: 'Proyek e-commerce B2C.', phases: [] }
];
const initialPriceDatabase: PriceDatabaseItem[] = [
  { id: 'pd-init-1', category: 'Material', itemName: 'Semen Portland (50kg)', unit: 'sak', unitPrice: 65000, priceSource: 'Toko Bangunan A', lastUpdated: '2024-07-01T10:00:00Z' },
  { id: 'pd-init-2', category: 'Jasa Pekerja', itemName: 'Tukang Batu', unit: 'HOK', unitPrice: 150000, lastUpdated: '2024-07-01T10:00:00Z' },
];
const initialWorkItems: WorkItem[] = [
    { id: 'wi-init-1', name: 'Pembersihan Lokasi dan Pematokan', category: 'Sipil', unit: 'Ls', defaultPrice: 5000000, source: 'AHS', lastUpdated: new Date().toISOString(), defaultAhs: [] }
];

export const initialData = { initialUsers, initialProjects, initialRabData, initialBqData, initialPriceDatabase, initialWorkItems };

// --- DATABASE INITIALIZATION ---

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        "lastLogin" TIMESTAMPTZ,
        status VARCHAR(50) NOT NULL,
        password VARCHAR(255),
        "photoUrl" TEXT,
        permissions TEXT,
        plant TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        team TEXT,
        status VARCHAR(50),
        "dueDate" DATE,
        progress INTEGER,
        phases JSONB,
        "group" VARCHAR(255),
        description TEXT,
        "finishDate" DATE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(255) PRIMARY KEY,
        is_bq BOOLEAN NOT NULL,
        "eMPR" VARCHAR(255),
        "projectName" TEXT,
        pic VARCHAR(255),
        "surveyDate" DATE,
        "receivedDate" DATE,
        "finishDate" DATE,
        status VARCHAR(50),
        sla INTEGER,
        "tenderValue" BIGINT,
        keterangan TEXT,
        "detailItems" JSONB,
        "pdfReady" BOOLEAN,
        "creatorName" VARCHAR(255),
        "approverName" VARCHAR(255),
        "workDuration" INTEGER,
        "revisionText" VARCHAR(255),
        "isLocked" BOOLEAN,
        "revisionHistory" JSONB,
        "approvalRequestDetails" JSONB
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS price_database (
        id VARCHAR(255) PRIMARY KEY,
        category VARCHAR(255),
        "itemName" TEXT NOT NULL,
        unit VARCHAR(50),
        "unitPrice" BIGINT,
        "priceSource" VARCHAR(255),
        "lastUpdated" TIMESTAMPTZ
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS work_items (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        category VARCHAR(255),
        unit VARCHAR(50),
        "defaultPrice" BIGINT,
        source VARCHAR(50),
        "lastUpdated" TIMESTAMPTZ,
        "defaultAhs" JSONB
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          author VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Seed initial data if tables are empty
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    if (userCount[0].count === '0') {
      for (const user of initialUsers) { await createUser(user); }
    }
    
    const projectCount = await sql`SELECT COUNT(*) FROM projects`;
    if (projectCount[0].count === '0') {
        for (const project of initialProjects) {
            await sql`
                INSERT INTO projects (id, name, team, status, "dueDate", progress, phases, "group", description, "finishDate")
                VALUES (${project.id}, ${project.name}, ${project.team.join(',')}, ${project.status}, ${project.dueDate}, ${project.progress}, ${project.phases ? JSON.stringify(project.phases) : null}, ${project.group}, ${project.description}, ${project.finishDate || null})
            `;
        }
    }
    
    const docCount = await sql`SELECT COUNT(*) FROM documents`;
    if (docCount[0].count === '0') {
        for (const doc of initialRabData) {
            await sql`INSERT INTO documents (id, is_bq, "eMPR", "projectName", pic, "surveyDate", "receivedDate", "finishDate", status, sla, "tenderValue", keterangan, "detailItems", "pdfReady", "creatorName", "approverName", "workDuration", "revisionText", "isLocked") VALUES (${doc.id}, false, ${doc.eMPR}, ${doc.projectName}, ${doc.pic}, ${doc.surveyDate}, ${doc.receivedDate}, ${doc.finishDate}, ${doc.status}, ${doc.sla}, ${doc.tenderValue}, ${doc.keterangan}, ${JSON.stringify(doc.detailItems)}, ${doc.pdfReady}, ${doc.creatorName}, ${doc.approverName}, ${doc.workDuration}, ${doc.revisionText}, ${doc.isLocked})`;
        }
        for (const doc of initialBqData) {
            await sql`INSERT INTO documents (id, is_bq, "eMPR", "projectName", pic, "surveyDate", "receivedDate", "finishDate", status, sla, "tenderValue", keterangan, "detailItems", "pdfReady", "creatorName", "approverName", "workDuration", "revisionText", "isLocked") VALUES (${doc.id}, true, ${doc.eMPR}, ${doc.projectName}, ${doc.pic}, ${doc.surveyDate}, ${doc.receivedDate}, ${doc.finishDate}, ${doc.status}, ${doc.sla}, ${doc.tenderValue}, ${doc.keterangan}, ${JSON.stringify(doc.detailItems)}, ${doc.pdfReady}, ${doc.creatorName}, ${doc.approverName}, ${doc.workDuration}, ${doc.revisionText}, ${doc.isLocked})`;
        }
    }
    
    const priceDbCount = await sql`SELECT COUNT(*) FROM price_database`;
    if (priceDbCount[0].count === '0') {
        for (const item of initialPriceDatabase) {
            await sql`INSERT INTO price_database (id, category, "itemName", unit, "unitPrice", "priceSource", "lastUpdated") VALUES (${item.id}, ${item.category}, ${item.itemName}, ${item.unit}, ${item.unitPrice}, ${item.priceSource}, ${item.lastUpdated})`;
        }
    }
    
    const workItemCount = await sql`SELECT COUNT(*) FROM work_items`;
    if (workItemCount[0].count === '0') {
        for (const item of initialWorkItems) {
            await sql`INSERT INTO work_items (id, name, category, unit, "defaultPrice", source, "lastUpdated", "defaultAhs") VALUES (${item.id}, ${item.name}, ${item.category}, ${item.unit}, ${item.defaultPrice}, ${item.source}, ${item.lastUpdated}, ${JSON.stringify(item.defaultAhs || [])})`;
        }
    }

  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

// --- DATA FETCHING ---

export async function fetchData() {
    try {
        const [projectsRes, documentsRes, priceDatabaseRes, workItemsRes] = await Promise.all([
            sql`SELECT * FROM projects`,
            sql`SELECT * FROM documents`,
            sql`SELECT * FROM price_database`,
            sql`SELECT * FROM work_items`
        ]);

        const projects: Project[] = projectsRes.map((p: any) => ({
            ...p,
            team: p.team ? p.team.split(',') : [],
            phases: p.phases || [],
        }));
        
        const documents: any[] = documentsRes;

        const rabData: RabDocument[] = documents
            .filter(d => !d.is_bq)
            .map(d => ({
                ...d,
                is_bq: undefined,
                detailItems: d.detailItems || [],
                revisionHistory: d.revisionHistory || [],
                approvalRequestDetails: d.approvalRequestDetails || null,
            }));
        
        const bqData: RabDocument[] = documents
            .filter(d => d.is_bq)
            .map(d => ({
                ...d,
                is_bq: undefined,
                detailItems: d.detailItems || [],
                revisionHistory: d.revisionHistory || [],
                approvalRequestDetails: d.approvalRequestDetails || null,
            }));
        
        const workItems: WorkItem[] = workItemsRes.map((w: any) => ({
            ...w,
            defaultAhs: w.defaultAhs || [],
        }));

        const priceDatabase: PriceDatabaseItem[] = priceDatabaseRes as any;
        
        const priceCategories = [...new Set(priceDatabase.map(item => item.category))];
        const workCategories = [...new Set(workItems.map(item => item.category))];

        return { projects, rabData, bqData, priceDatabase, workItems, priceCategories, workCategories };
    } catch (error) {
        console.error("Failed to fetch data:", error);
        // Return empty arrays as a fallback to prevent the app from crashing
        return {
            projects: [], rabData: [], bqData: [], priceDatabase: [], workItems: [], priceCategories: [], workCategories: []
        };
    }
}


// --- DATA MUTATION ---

// USER
export async function createUser(data: Omit<User, 'id' | 'lastLogin'>): Promise<User | null> {
    const newUser: User = { ...data, id: `usr-${Date.now()}`, lastLogin: new Date().toISOString() };
    const { permissions, plant, ...restOfUser } = newUser;
    try {
        await sql`
            INSERT INTO users (id, username, name, email, role, "lastLogin", status, password, "photoUrl", permissions, plant)
            VALUES (${newUser.id}, ${newUser.username}, ${newUser.name}, ${newUser.email}, ${newUser.role}, ${newUser.lastLogin}, ${newUser.status}, ${newUser.password}, ${newUser.photoUrl}, ${permissions.join(',')}, ${plant.join(',')})
        `;
        return newUser;
    } catch (error) {
        console.error("DB Create User Error:", error);
        return null;
    }
}

export async function updateUser(id: string, data: Partial<User>): Promise<boolean> {
    try {
        const updates: Record<string, any> = {};
        if (data.username !== undefined) updates.username = data.username;
        if (data.name !== undefined) updates.name = data.name;
        if (data.email !== undefined) updates.email = data.email;
        if (data.role !== undefined) updates.role = data.role;
        if (data.lastLogin !== undefined) updates.lastLogin = data.lastLogin;
        if (data.status !== undefined) updates.status = data.status;
        if (data.password && data.password.length > 0) updates.password = data.password;
        if (data.photoUrl !== undefined) updates.photoUrl = data.photoUrl;
        if (data.permissions !== undefined) updates.permissions = data.permissions.join(',');
        if (data.plant !== undefined) updates.plant = data.plant.join(',');

        const keys = Object.keys(updates);
        if (keys.length === 0) return true;
        
        // FIX: The `sql.join` helper was causing a type error.
        // Replaced with the `sql(object, ...keys)` helper which is a cleaner and more robust way to handle dynamic SET clauses with the 'postgres.js' library.
        await sql`UPDATE users SET ${sql(updates, ...keys)} WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error("DB Update User Error:", error);
        return false;
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        await sql`DELETE FROM users WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error("DB Delete User Error:", error);
        return false;
    }
}