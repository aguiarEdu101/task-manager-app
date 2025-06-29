// src/database/database.ts
import * as SQLite from 'expo-sqlite';
import { PromiseResponseError } from '../types/PromiseResponseError.type';

let db: SQLite.SQLiteDatabase | null = null; // Inicializa como null
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null; // Para gerenciar a promessa de abertura

// Função para obter a instância do banco de dados
export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) {
        return db; // Se já tivermos uma instância, retorne-a
    }

    if (dbPromise) {
        return dbPromise; // Se a abertura já estiver em andamento, retorne a promessa existente
    }

    // Se não tivermos uma instância e nenhuma abertura em andamento, inicie a abertura
    dbPromise = new Promise(async (resolve, reject) => {
        try {
            console.log('Tentando abrir e inicializar o banco de dados...');
            const newDb = await SQLite.openDatabaseAsync('taskManager.db');
            await newDb.execAsync(
                `CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'pending'
        );`
            );
            console.log('Tabela tasks criada ou já existente. Banco de dados pronto.');
            db = newDb; // Armazena a instância aberta
            resolve(newDb);
        } catch (error) {
            console.error('Erro ao abrir ou inicializar o banco de dados:', error);
            dbPromise = null; // Reseta a promessa para tentar novamente se houver erro
            reject(error);
        }
    });

    return dbPromise;
};

// Funções de CRUD atualizadas para usar getDb()
export const addTask = async (title: string, description: string) => {
    const database = await getDb();
    try {
        const result = await database.runAsync(
            'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
            [title, description, 'pending']
        );
        return result;
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        throw error;
    }
};

export const getTasks = async () => {
    const database = await getDb();
    try {
        const allRows = await database.getAllAsync('SELECT * FROM tasks');
        return allRows;
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
    }
};

export const getTaskById = async (id: number): Promise<Record<string, any> | PromiseResponseError> => {
    const database = await getDb();
    try {
        const row = await database.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [id]) as Record<string, any>;
        return row;
    } catch (error) {
        console.error(`Erro ao buscar tarefa ${id}:`, error);
        throw error as PromiseResponseError;
    }
};

export const updateTask = async (id: number, title: string, description: string, status: string) => {
    const database = await getDb();
    try {
        const result = await database.runAsync(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description, status, id]
        );
        return result;
    } catch (error) {
        console.error(`Erro ao atualizar tarefa ${id}:`, error);
        throw error;
    }
};

export const deleteTask = async (id: number) => {
    const database = await getDb();
    try {
        const result = await database.runAsync(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );
        return result;
    } catch (error) {
        console.error(`Erro ao excluir tarefa ${id}:`, error);
        throw error;
    }
};