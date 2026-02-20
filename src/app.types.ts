import { FastifyRequest } from 'fastify';
import { UserEntity } from 'src/database/entities/user.entity';

export type AuthorizedFastifyRequest = FastifyRequest & {
  user: UserEntity;
};
