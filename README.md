# URL Shortener Project

This project is a URL shortener web application similar to Bitly or TinyURL. It allows users to create shortened URLs, manage them, and view statistics about their usage. The project is divided into four main components:

- **Backend**: An Express-based RESTful API that handles URL shortening, redirection, and statistics.
- **Slug Service**: A microservice responsible for generating unique slugs for shortened URLs.
- **Frontend**: A React application that provides a user interface to interact with the URL shortener.
- **Database**: A simple database created in Postgres to store shortened URL.

## Prerequisites

- **Docker and Docker Compose**: For containerizing and running the services.
- **Node.js and npm**: For local development and running unit tests.
- **Postman** (Optional): For manually testing API endpoints.
- **psql or SQL Client** (Optional): For interacting with the PostgreSQL database directly.

## Project Structure

- `backend/`: The Express server handling the main API logic.
- `slug-service/`: The microservice for generating unique slugs.
- `frontend/`: The React app for interacting with the URL shortener.
- `database/`: Schema definition for the postgres database.

## Running the Project Using Docker

You can run all components using Docker to simplify the setup.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd url-shortener
```

### Step 2: Setting Up Environment Variables

To configure environment variables for the project, create a `.env` file in the root directory of each component (`backend`, `slug-service`, etc.). You can use the provided `.env.example` as a reference:

```bash
cp .env.example .env
```


### Step 3: Run Docker Compose

Ensure you are in the root directory of the project, then run the following command to build and start all services:

```bash
docker-compose up --build
```

### Step 4: Access the Application

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API**: Available at [http://localhost:8080](http://localhost:8080).
- **Slug Service**: Internally used by the backend (port 8081).
- **PgAdmin**: Administrate the database at [http://localhost:5050](http://localhost:5050)

### Step 5: Stopping the Services

To stop the Docker containers, run:

```bash
docker-compose down
```

### Explanation of Each Container

This project generate 5 Docker images:

1. **backend**: The backend service is the core API of the application. It handles business logic, processes client requests, and interacts with the PostgreSQL database. It also communicates with the `slug-service` to generate unique identifiers or slugs needed for functionalities like URL shortening.
2. **slug-service**: The slug-service is a microservice responsible for generating unique slugs or identifiers. This is particularly useful for future expansion or scaling. It can be upgraded independently and can be called by multiple services.
3. **postgres**: This service runs a PostgreSQL database instance. It stores all the persistent data required by the application. The database is configured using the provided environment variables and is exposed on the default PostgreSQL port.
4. **pgadmin**:  pgAdmin is a web-based administration tool for PostgreSQL. 
5. **frontend**: The frontend service serving the client-side React app. 

## Running Automated Unit-Tests

The project includes unit tests that verify the correctness of the endpoints and logic.

To run the tests, navigate to either `backend` or `slug-service` and then run the following commands:

```bash
npm test
```

The tests use Jest and Supertest to verify API endpoints, and they include checks for edge cases and error handling.  The --coverage flag is used to generate a code coverage report.

## Postman Testing

You can manually test the API endpoints using Postman by following these steps:

### Step 1: Test Backend Endpoints

1. **POST /shorten**
   - **URL**: `http://localhost:8080/shorten`
   - **Method**: POST
   - **Body**: Select "raw" and "JSON" format, then provide the following JSON:
     ```json
     {
       "url": "https://www.example.com"
     }
     ```
   - **Send Request**: Click "Send" and verify that the response contains the shortened URL.

2. **GET /:slug**
   - **URL**: `http://localhost:8080/{slug}` (replace `{slug}` with the actual slug returned from the `/shorten` endpoint)
   - **Method**: GET
   - **Send Request**: Click "Send" and verify that it redirects to the original URL.

3. **GET /stats**
   - **URL**: `http://localhost:8080/stats`
   - **Method**: GET
   - **Query Parameters** (optional):
     - `startDate`: Specify the start date in `YYYY-MM-DD` format.
     - `endDate`: Specify the end date in `YYYY-MM-DD` format.
   - **Send Request**: Click "Send" and verify that the response contains statistics about shortened URLs.

### Step 2: Test Slug-Service Endpoints

1. **GET /generate-slug**
   - **URL**: `http://localhost:8081/generate-slug`
   - **Method**: GET
   - **Send Request**: Click "Send" and verify that the response contains a unique slug.
   - **Expected Response**:
     ```json
     {
       "slug": "abc123"
     }
     ```
     *Note*: The `slug` value will be a randomly generated string of 6 characters.


## Deploying to GCP using Terraform

This project can be deployed on Google Cloud Platform (GCP) using Terraform. Below are the instructions for pushing Docker images and running Terraform.


### Prerequisites for GCP

Before deploying to GCP, ensure you have the following:

- **Google Cloud SDK:** Installed and configured.
- **Terraform:** Installed.
- **GCP Project:** A GCP project is set up (e.g., `url-shortener-project-438318`).
- **Service Account & Key:** A service account is created and it's key file (`gcp-key.json`) downloaded for authentication purposes.
- **Docker:** Installed and configured.

### Setting Up GCP
1. Enable Necessary APIs in GCP:
   - Compute Engine API: Required for provisioning virtual machines.
   - Cloud Run API: Required for deploying containerized applications.
   - Cloud SQL Admin API: Required for managing PostgreSQL instances.
   - Artifact Registry API: Required for storing and retrieving container images.

2. Authenticate using the service account key file:
   ```sh
   export GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"
   gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
   ```
### Step 1: Pre-Build and Push Docker Images
The Terraform configuration uses custom Docker images that need to be pushed to Artifact Registry prior to running Terraform. Use the `docker_push.sh` script to push the Docker images after building them.

#### Configuring Artifact Registry
1. Set Up an Artifact Registry Repository
   - Create a Docker repository in Artifact Registry named `url-shortener` or any name you prefer.
   - Note the repository location (e.g., `us-central1-docker.pkg.dev`).
2. Authenticate Docker with Artifact Registry
   ```sh
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```
   Replace `us-central1` with your repository's region.

#### Build Docker Images Locally

Before running `docker_push.sh`, ensure you've built the Docker images:
```sh
docker build -t url-shortener-backend:latest ./backend
docker build -t url-shortener-frontend:latest ./frontend
docker build -t url-shortener-slug-service:latest ./slug-service
```

#### Running the Docker Push Script
Run the script:

```sh
./docker_push.sh
```
This will authenticate Docker with Artifact Registry, build, and push the following images:
- `url-shortener-backend`
- `url-shortener-frontend`
- `url-shortener-slug-service`

### Step 2: Running Terraform

#### 1. Initialize Terraform
First, initialize Terraform to set up the environment.

```sh
terraform init
```

#### 2. Plan the Terraform Deployment
The `terraform plan` command creates an execution plan to help visualize the changes that Terraform will make in the GCP environment.

```sh
terraform plan
```

#### 3. Apply the Terraform Configuration
To deploy the infrastructure to GCP, run the `terraform apply` command.

```sh
terraform apply
```

This command will prompt you to confirm the changes. Type `yes` to proceed.

### Step 3: Initialize the Database
After the PostgreSQL instance is created by Terraform, you need to manually run an SQL script to initialize the database.

#### Running the Initialization Script

1. Connect to the PostgreSQL instance using the public IP address using pgAdmin.
2. Run the `init.sql` script located in `database/init.sql` to create the necessary tables:

   ```sql
   CREATE TABLE IF NOT EXISTS urls (
       id SERIAL PRIMARY KEY,
       slug VARCHAR(255) UNIQUE NOT NULL,
       original_url TEXT NOT NULL,
       visit_count INTEGER DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

You can also use a tool like `psql` to run this script or any other SQL client of your choice.

### Important Notes
- **Docker Images:** Must be pushed before running Terraform to ensure that GCP Cloud Run can pull them.
- **Security:** Keep your gcp-key.json file secure.
- **Firewall Rules:** Modify the firewall rules or authorized networks in your Terraform configuration if you need more restricted access to the deployed services.

### Cleanup
To destroy the resources created by Terraform, run:

```sh
terraform destroy
```
This will remove all the resources created by the Terraform script.

## Future Expansion

Here are some potential features that could be added to expand the functionality of the URL shortener:

1. **User System**
   - Add a user registration and authentication system to allow users to manage their shortened URLs.
   - Users would be able to log in, create, edit, and delete their shortened URLs.

2. **Custom URLs**
   - Allow users to create custom slugs instead of using automatically generated ones.
   - This feature could be useful for creating memorable or branded short links.

3. **URL Expiration**
   - Add an expiration feature to allow users to set an expiration date for their shortened URLs.
   - After the expiration date, the URL would no longer be accessible, and the slug could be reused.

4. **Analytics Dashboard**
   - Create a detailed analytics dashboard for users to track the number of clicks, geographical location of users, and other useful metrics.
   - This would provide insights into how the shortened URLs are being used.

5. **Rate Limiting**
   - Implement rate limiting to prevent abuse of the service, such as limiting the number of requests per minute per user or IP address.

6. **API Key System**
   - Add an API key system for accessing the API programmatically.
   - Users would need an API key to interact with the API, and this would help control access and prevent abuse.

## Notes

- The project is configured to connect to a PostgreSQL database, which is managed through Docker.
- Make sure Docker is running before executing the commands to ensure all services run properly.

## Credit & Contact
- Author: Bill Yu
- Email: BillSoftwareEngineer@outlook.com

## License

This project is licensed under the MIT License.