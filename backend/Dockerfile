# Backend Dockerfile - Multi-stage build for production
# =====================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ---------------------------------------------------
# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:nodejs . .

# Remove unnecessary files
RUN rm -rf scripts/*.js 2>/dev/null || true

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
