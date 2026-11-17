
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

// Verificar que el usuario esté autenticado
export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      error: 'Token de autenticación requerido'
    });
  }

  const token = authorization.slice(7).trim();

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    // Obtener el rol actual desde la base de datos
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
}

// Comprobar permisos según el rol
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'No tienes permiso para esta operación'
      });
    }

    next();
  };
}
