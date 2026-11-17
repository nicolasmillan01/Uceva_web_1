import type { RequestHandler } from 'express';

export const authenticate: RequestHandler;

export function authorize(
  ...roles: Array<'cliente' | 'agente' | 'administrador'>
): RequestHandler;