export const cacheRefreshToken = (token: string) => `refresh:${token}`;
export const cacheRateLimit = (email: string) => `rate-limit:recovery:${email}`;
export const cacheKey = (key: string) => `key:${key}`;
export const cacheMyPortfolio = (id: string) => `my-portfolio:${id}`;
export const cacheGetAllProjects = (suffix = '') => `portfolio:all:${suffix}`;

export const cacheAllCities = () => `cities:all`;
export const cacheCitiesId = (id: string) => `cities:id:${id}`;
export const cacheCitiesSlug = (slug: string) => `cities:slug:${slug}`;
