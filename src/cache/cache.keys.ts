// авторизация
export const cacheRefreshToken = (userId: string, token: string) => `refresh:${userId}:${token}`;
export const cacheRateLimit = (email: string) => `rate-limit:recovery:${email}`;
export const cacheKey = (key: string) => `key:${key}`;

// города
export const cacheAllCities = () => `cities:all`;
export const cacheCitiesId = (id: string) => `cities:id:${id}`;
export const cacheCitiesSlug = (slug: string) => `cities:slug:${slug}`;

// категории
export const cacheAllCategories = () => `categories:all`;
export const cacheCategoryId = (id: string) => `categories:id:${id}`;
export const cacheCategorySlug = (slug: string) => `categories:slug:${slug}`;
