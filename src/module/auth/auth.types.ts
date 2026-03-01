import { FastifyRequest } from 'fastify';
import { UserEntity } from '../../database/entities';

export type JwtPayload = {
  id: UserEntity['id'];
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
  };
}
