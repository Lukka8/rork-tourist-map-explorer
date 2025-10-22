import pool from '../connection';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
}

export const createUser = async (userData: CreateUserInput): Promise<User> => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (username, firstname, lastname, email, phone, password) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userData.username, userData.firstname, userData.lastname, userData.email, userData.phone, hashedPassword]
  );

  const [rows] = await pool.query<(User & RowDataPacket)[]>(
    'SELECT id, username, firstname, lastname, email, phone, email_verified, phone_verified, created_at, updated_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return rows[0];
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const [rows] = await pool.query<(User & RowDataPacket)[]>(
    'SELECT id, username, firstname, lastname, email, phone, email_verified, phone_verified, created_at, updated_at FROM users WHERE username = ?',
    [username]
  );

  return rows[0] || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query<(User & RowDataPacket)[]>(
    'SELECT id, username, firstname, lastname, email, phone, email_verified, phone_verified, created_at, updated_at FROM users WHERE email = ?',
    [email]
  );

  return rows[0] || null;
};

export const findUserById = async (userId: number): Promise<User | null> => {
  const [rows] = await pool.query<(User & RowDataPacket)[]>(
    'SELECT id, username, firstname, lastname, email, phone, email_verified, phone_verified, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  return rows[0] || null;
};

export const validatePassword = async (username: string, password: string): Promise<User | null> => {
  interface UserWithPassword extends User {
    password: string;
  }

  const [rows] = await pool.query<(UserWithPassword & RowDataPacket)[]>(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  const user = rows[0];
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateEmailVerified = async (userId: number): Promise<void> => {
  await pool.query(
    'UPDATE users SET email_verified = TRUE WHERE id = ?',
    [userId]
  );
};

export const updatePhoneVerified = async (userId: number): Promise<void> => {
  await pool.query(
    'UPDATE users SET phone_verified = TRUE WHERE id = ?',
    [userId]
  );
};
