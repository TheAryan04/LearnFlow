import { ApiError } from './errors.js';

/**
 * Parse opt-in pagination parameters while preserving the legacy unpaginated
 * response when neither page nor limit is supplied.
 */
export function parsePageOptions(query = {}, { defaultLimit = 12, maxLimit = 50 } = {}) {
  const enabled = query.page !== undefined || query.limit !== undefined;
  if (!enabled) return { enabled: false, page: 1, limit: null, skip: 0 };

  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new ApiError(400, 'Page must be a positive whole number');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > maxLimit) {
    throw new ApiError(400, `Limit must be a whole number between 1 and ${maxLimit}`);
  }

  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) throw new ApiError(400, 'Page is too large');
  return { enabled: true, page, limit, skip };
}
