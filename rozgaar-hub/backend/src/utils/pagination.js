/**
 * Pagination utility function
 * @param {Object} query - Mongoose query object
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Items per page (default: 20)
 * @returns {Object} - Paginated results with metadata
 */
export const paginate = async (query, page = 1, limit = 20) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Ensure valid values
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 20;

    const skip = (validPage - 1) * validLimit;

    // Execute query with pagination
    const results = await query.skip(skip).limit(validLimit);

    // Get total count
    const total = await query.model.countDocuments(query.getFilter());

    return {
        data: results,
        pagination: {
            page: validPage,
            limit: validLimit,
            total,
            pages: Math.ceil(total / validLimit),
            hasNext: validPage < Math.ceil(total / validLimit),
            hasPrev: validPage > 1
        }
    };
};

/**
 * Build pagination metadata for response
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @returns {Object} - Pagination metadata
 */
export const buildPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);

    return {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

/**
 * Extract pagination params from request
 * @param {Object} req - Express request object
 * @returns {Object} - Page and limit values
 */
export const getPaginationParams = (req) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    return {
        page: page > 0 ? page : 1,
        limit: limit > 0 && limit <= 100 ? limit : 20
    };
};
