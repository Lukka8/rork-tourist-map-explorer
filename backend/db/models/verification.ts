import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface VerificationCode {
  id: number;
  user_id: number;
  type: 'email' | 'phone';
  code: string;
  expires_at: Date;
  verified: boolean;
  created_at: Date;
}

export const createVerificationCode = async (
  userId: number,
  type: 'email' | 'phone'
): Promise<string> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query<ResultSetHeader>(
    'INSERT INTO verification_codes (user_id, type, code, expires_at) VALUES (?, ?, ?, ?)',
    [userId, type, code, expiresAt]
  );

  return code;
};

export const verifyCode = async (
  userId: number,
  type: 'email' | 'phone',
  code: string
): Promise<boolean> => {
  const [rows] = await pool.query<(VerificationCode & RowDataPacket)[]>(
    `SELECT * FROM verification_codes 
     WHERE user_id = ? AND type = ? AND code = ? AND verified = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId, type, code]
  );

  if (rows.length === 0) {
    return false;
  }

  await pool.query<ResultSetHeader>(
    'UPDATE verification_codes SET verified = TRUE WHERE id = ?',
    [rows[0].id]
  );

  return true;
};

export const deleteOldVerificationCodes = async (
  userId: number,
  type: 'email' | 'phone'
): Promise<void> => {
  await pool.query<ResultSetHeader>(
    'DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = FALSE',
    [userId, type]
  );
};
