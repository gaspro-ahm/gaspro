// This file now uses localStorage for all data persistence, removing the need for
// an external database connection and resolving all associated errors. This provides
// a faster, more stable, and offline-capable experience for the application.

import { 
    type User, type Project, type RabDocument, type PriceDatabaseItem, 
    type WorkItem, type Post, type PermissionId
} from '../types';

// --- LOCAL STORAGE KEYS ---
const LS_KEYS = {
    PROJECTS: 'gaspro_projects',
    RAB_DATA: 'gaspro_rabData',
    BQ_DATA: 'gaspro_bqData',
    PRICE_DB: 'gaspro_priceDatabase',
    WORK_ITEMS: 'gaspro_workItems',
    USERS: 'gaspro_users',
    LOGS: 'gaspro_logs',
    POSTS: 'gaspro_posts',
};

// --- INITIAL DATA (for first-time setup or reset) ---
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
const initialPosts: Post[] = [
    { id: 1, title: 'Selamat Datang di GAS Pro!', content: 'Ini adalah platform baru untuk manajemen proyek yang lebih baik. Jelajahi fitur-fitur yang ada.', author: 'Admin Utama', created_at: new Date().toISOString() },
];

export const initialData = { initialUsers, initialProjects, initialRabData, initialBqData, initialPriceDatabase, initialWorkItems, initialPosts };

// --- HELPER FUNCTIONS ---
function getItem<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
  }
}

// --- DATABASE INITIALIZATION (now for localStorage) ---
export function initializeDatabase() {
  if (!localStorage.getItem(LS_KEYS.USERS)) {
    setItem(LS_KEYS.USERS, initialData.initialUsers);
    setItem(LS_KEYS.PROJECTS, initialData.initialProjects);
    setItem(LS_KEYS.RAB_DATA, initialData.initialRabData);
    setItem(LS_KEYS.BQ_DATA, initialData.initialBqData);
    setItem(LS_KEYS.PRICE_DB, initialData.initialPriceDatabase);
    setItem(LS_KEYS.WORK_ITEMS, initialData.initialWorkItems);
    setItem(LS_KEYS.POSTS, initialData.initialPosts);
  }
}

// --- DATA FETCHING ---
export function fetchData() {
    const projects = getItem(LS_KEYS.PROJECTS, initialData.initialProjects);
    const rabData = getItem(LS_KEYS.RAB_DATA, initialData.initialRabData);
    const bqData = getItem(LS_KEYS.BQ_DATA, initialData.initialBqData);
    const priceDatabase = getItem(LS_KEYS.PRICE_DB, initialData.initialPriceDatabase);
    const workItems = getItem(LS_KEYS.WORK_ITEMS, initialData.initialWorkItems);
    
    const priceCategories = [...new Set(priceDatabase.map(item => item.category))];
    const workCategories = [...new Set(workItems.map(item => item.category))];

    return { projects, rabData, bqData, priceDatabase, workItems, priceCategories, workCategories };
}

export function fetchPosts(): Post[] {
    return getItem(LS_KEYS.POSTS, initialData.initialPosts);
}

// --- DATA MUTATION ---

// DOCUMENT (RAB/BQ)
export function createDocument(data: Omit<RabDocument, 'id' | 'sla' | 'detailItems' | 'pdfReady'>, is_bq: boolean): RabDocument {
    const key = is_bq ? LS_KEYS.BQ_DATA : LS_KEYS.RAB_DATA;
    const docs = getItem<RabDocument[]>(key, []);
    const newDoc: RabDocument = { 
        ...data, 
        id: `${is_bq ? 'bq' : 'rab'}-${Date.now()}`,
        sla: 0,
        detailItems: [],
        pdfReady: false,
    };
    setItem(key, [...docs, newDoc]);
    return newDoc;
}

export function updateDocument(id: string, data: Partial<RabDocument>): boolean {
    const isBq = id.startsWith('bq-');
    const key = isBq ? LS_KEYS.BQ_DATA : LS_KEYS.RAB_DATA;
    const docs = getItem<RabDocument[]>(key, []);
    const docIndex = docs.findIndex(d => d.id === id);

    if (docIndex !== -1) {
        docs[docIndex] = { ...docs[docIndex], ...data };
        setItem(key, docs);
        return true;
    }
    return false;
}

export function deleteDocument(id: string): boolean {
    const isBq = id.startsWith('bq-');
    const key = isBq ? LS_KEYS.BQ_DATA : LS_KEYS.RAB_DATA;
    const docs = getItem<RabDocument[]>(key, []);
    const newDocs = docs.filter(d => d.id !== id);

    if (newDocs.length < docs.length) {
        setItem(key, newDocs);
        return true;
    }
    return false;
}

// USER
export function createUser(data: Omit<User, 'id' | 'lastLogin'>): User {
    const users = getItem<User[]>(LS_KEYS.USERS, []);
    const newUser: User = { ...data, id: `usr-${Date.now()}`, lastLogin: new Date().toISOString() };
    setItem(LS_KEYS.USERS, [...users, newUser]);
    return newUser;
}

export function updateUser(id: string, data: Partial<User>): boolean {
    const users = getItem<User[]>(LS_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        setItem(LS_KEYS.USERS, users);
        return true;
    }
    return false;
}

export function deleteUser(id: string): boolean {
    const users = getItem<User[]>(LS_KEYS.USERS, []);
    const newUsers = users.filter(u => u.id !== id);
    if (newUsers.length < users.length) {
        setItem(LS_KEYS.USERS, newUsers);
        return true;
    }
    return false;
}

// SAVE ALL DATA
export function saveAllDataToDb(data: {
    projects: Project[],
    rabData: RabDocument[],
    bqData: RabDocument[],
    priceDatabase: PriceDatabaseItem[],
    workItems: WorkItem[],
}): boolean {
    try {
        setItem(LS_KEYS.PROJECTS, data.projects);
        setItem(LS_KEYS.RAB_DATA, data.rabData);
        setItem(LS_KEYS.BQ_DATA, data.bqData);
        setItem(LS_KEYS.PRICE_DB, data.priceDatabase);
        setItem(LS_KEYS.WORK_ITEMS, data.workItems);
        return true;
    } catch (error) {
        console.error("Error saving all data to localStorage:", error);
        return false;
    }
}
// This function is no longer needed but kept for API compatibility with Admin page
export const sql = {};
