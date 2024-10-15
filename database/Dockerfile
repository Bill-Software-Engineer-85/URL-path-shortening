# Use the official Postgres image as a base
FROM postgres:17

# Add the init.sql script to a directory that Postgres will look at for initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Set environment variables
ENV POSTGRES_DB urlshortener
ENV POSTGRES_USER user
ENV POSTGRES_PASSWORD password