# URL Shortener Project

This project is a URL shortener web application similar to Bitly or TinyURL. It allows users to create shortened URLs, manage them, and view statistics about their usage. The project is divided into four main components:

- **Backend**: An Express-based RESTful API that handles URL shortening, redirection, and statistics.
- **Slug Service**: A microservice responsible for generating unique slugs for shortened URLs.
- **Frontend**: A React application that provides a user interface to interact with the URL shortener.
- **Database**: A simple database created in Postgres to store shortened URL.

## Prerequisites

- Docker and Docker Desktop installed.
- Node.js and npm (for running locally).

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

This command will:

- Build and run the backend server, slug service, and frontend.
- Run a PostgreSQL container to store URLs and statistics.

### Step 4: Access the Application

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API**: Available at [http://localhost:8080](http://localhost:8080).
- **Slug Service**: Internally used by the backend (port 8081).

### Step 5: Stopping the Services

To stop the Docker containers, run:

```bash
docker-compose down
```

## Running Automated Unit-Tests

The project includes unit tests that verify the correctness of the endpoints and logic.

To run the tests, navigate to either backend or slug-service and then run the following commands:

```bash
npm test
```

The tests use Jest and Supertest to verify API endpoints, and they include checks for edge cases and error handling.  The --coverage flag is used to generate a code coverage report.

## API Endpoints and Postman Testing

### Backend API

The following API are included for this project:

- **POST /shorten**: Shorten a new URL.
  - Request Body: `{ "url": "<original_url>" }`
  - Response: `{ "shortenedUrl": "<shortened_url>" }`

- **GET /:slug**: Redirect to the original URL based on the provided slug.
  - Example: `/abc123`

- **GET /stats**: Get statistics about shortened URLs.
  - Query Parameters: `startDate` and `endDate` (optional).
  - Response: List of shortened URLs with statistics.

## Postman Testing

You can manually test the API endpoints using Postman by following these steps:

### Step 1: Set Up Postman

- Open Postman and create a new request.

### Step 2: Test Endpoints

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

## Deploying to GCP using Terraform

This project can be deployed on Google Cloud Platform (GCP) using Terraform. Below are the instructions for pushing Docker images and running Terraform.


### Prerequisites for GCP

- Google Cloud SDK installed and configured.
- A GCP project set up (e.g., `url-shortener-project-438318`).
- A service account key file (`gcp-key.json`) downloaded for authentication purposes.
- Docker installed and configured.
- Terraform installed.

### Setting Up GCP
1. Enable the necessary APIs in GCP, including:
   - Google Compute Engine API
   - Google Cloud Run API
   - Google Cloud SQL API

2. Authenticate using the service account key file:
   ```sh
   export GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"
   gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
   ```

### Step 1: Pre-Build and Push Docker Images
The Terraform configuration uses custom Docker images that need to be pushed to Google Container Registry (GCR) prior to running Terraform. Use the `docker_push.sh` script to push the Docker images after building the image.

### Running the Docker Push Script
1. Make the `docker_push.sh` script executable:
   ```sh
   chmod +x docker_push.sh
   ```

2. Run the script:
   ```sh
   ./docker_push.sh
   ```
   This will authenticate Docker with GCR, build, and push the following images:
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
terraform plan -var="credentials=gcp-key.json"
```

#### 3. Apply the Terraform Configuration
To deploy the infrastructure to GCP, run the `terraform apply` command.

```sh
terraform apply -var="credentials=gcp-key.json"
```

This command will prompt you to confirm the changes. Type `yes` to proceed.

### Step 3: Initialize the Database
After the PostgreSQL instance is created by Terraform, you need to manually run an SQL script to initialize the database.

#### Running the Initialization Script
1. Connect to the PostgreSQL instance using the public IP address.
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

You can use a tool like `psql` to run this script or any other SQL client of your choice.

### Important Notes
- The Docker images must be pushed before running Terraform to ensure that GCP Cloud Run can pull them.
- Make sure to keep your `gcp-key.json` file secure.
- Modify the firewall rules or authorized networks in `terraform.tf` if you need more restricted access to the deployed services.

### Cleanup
To destroy the resources created by Terraform, run:

```sh
terraform destroy -var="credentials=gcp-key.json"
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