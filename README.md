
# URL Shortener Project

This is a technical demostration of the URL shortening problem in the same vein as bitly, TinyURL, or the now defunct Google URL Shortener.

## Technologies Showcased

This project showcases several key technologies and design principles, focusing on micro-service architecture, DevOps (containerization, infrastructure as code), SaaS development, and web development:

1. **Microservices Architecture**: The project is designed using a microservice approach, where the URL shortening logic is separated into different components:
   - **Backend**: A RESTful API built with Express that handles core business logic.
   - **Slug Service**: A dedicated microservice responsible for generating unique slugs. As a standalone microservice, it has independent **scaling capabilities**, meaning it can be easily upgraded or scaled without affecting other parts of the system. This modular design improves flexibility and allows for isolated development or scaling of specific components.
  
2. **Containerization with Docker**: All components of the project are containerized using **Docker**, allowing for consistent environments across different deployment stages (local development, testing, production). Docker ensures easy replication of the services, simplifies the setup, and enhances portability.

3. **Orchestration with Docker Compose**: The use of **Docker Compose** to orchestrate the microservices and their dependencies (e.g., PostgreSQL database) demonstrates a practical approach to manage multi-container applications. It enables easy startup and teardown of services with just one command.

4. **Cloud Deployment and Autoscaling**:
   - The project is designed with cloud deployment in mind. For example, using **Google Cloud Run**, a serverless platform that automatically scales the services based on traffic. This ensures that the system can handle varying loads without manual intervention.
   - The system also has the potential for **distributed computing**, as it can be deployed across multiple regions with minimal effort. This enables global scalability, lower latency, and improved resilience in case of regional failures.
   - Terraform scripts can be used to automate infrastructure deployment on **Google Cloud Platform (GCP)**, making the system cloud-ready and efficient for resource management.

5. **Database and Storage**:
   - The project uses **PostgreSQL** as the relational database to store shortened URLs and associated metadata. This demonstrates the ability to handle persistence with relational databases and manage schema migrations using Docker.

6. **DevOps and Infrastructure as Code (IaC)**:
   - By integrating **Terraform** for infrastructure management, the project follows DevOps best practices of **Infrastructure as Code** (IaC). Terraform is used to provision and manage cloud resources like Cloud Run, ensuring reproducibility and reducing manual cloud setup errors.
   - The use of **Terraform** also emphasizes the importance of cloud automation, secure secret management (e.g., securing GCP service account keys), and configuring cloud firewalls for security.

7. **CI/CD Pipeline Potential**: With containerization and microservices, this project is well-suited for integration with CI/CD pipelines, enabling continuous integration and deployment for faster release cycles and automated testing.

### SaaS Development

This project aligns with modern **SaaS (Software as a Service)** development principles, allowing users to interact with the system via a cloud-hosted web application. The following SaaS-related technologies and concepts are demonstrated:

- **Scalability**: By leveraging **Google Cloud Run**, the services automatically scale to handle more requests based on demand, making the system well-suited for a multi-tenant SaaS platform.
- **Microservices**: The URL shortening logic is broken down into manageable, independent services, which allows for easy updates and independent deployment cycles for each service.
- **Security and Isolation**: Using microservices and cloud-native technologies allows each service to be isolated, which enhances security. Additionally, secrets management and authentication mechanisms can be easily integrated for SaaS use cases.
- **Cloud-Native Deployment**: The infrastructure is designed to be hosted on cloud platforms, demonstrating the potential to scale globally, with **multi-region deployments** ensuring that users from different regions can access the service with low latency.

### Web Development Technologies

The frontend of the project demonstrates the use of modern web development technologies and testing tools:

- **React**: A JavaScript library used for building dynamic, component-based user interfaces. In this project, the React frontend enables users to interact with the URL shortener, create and manage shortened URLs, and view usage statistics.
- **TypeScript**: The project utilizes **TypeScript** for the frontend, which provides type safety and helps reduce runtime errors, making the codebase more maintainable and scalable.
- **Jest**: **Jest** is used for unit testing the application. By writing automated unit tests, the project ensures that key functionality is well-tested, making future code changes safer.
- **Postman**: The project recommends using **Postman** for manual API testing, which allows for easy validation of the backend API and slug service without the need for a frontend interface. This is helpful during development and debugging to manually verify API responses.

This combination of backend, frontend, and testing technologies provides a well-rounded approach to building robust and scalable web applications, especially in the context of SaaS platforms.

## Project Structure

This URL shortener web application is divided into four main components, each housed in a separate folder:

- **Backend** (`backend/`): An Express-based RESTful API that handles URL shortening, redirection, and statistics.
- **Slug Service** (`slug-service/`): A microservice responsible for generating unique slugs for shortened URLs.
- **Frontend** (`frontend/`): A React application that provides a user interface for interacting with the URL shortener.
- **Database** (`database/`): A simple PostgreSQL database for storing shortened URLs. The folder contains the database schema and Docker configuration.

## Prerequisites for Local Deployment

- **Docker and Docker Compose**: For containerizing and running the services.
- **Node.js and npm**: For local development and running unit tests.
- **Postman** (Optional): For manually testing API endpoints.
- **psql or SQL Client** (Optional): For interacting with the PostgreSQL database directly.

## Running the Project Locally Using Docker

You can run all components using Docker to simplify the setup.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd url-shortener
```

### Step 2: Setting Up Environment Variables

To configure environment variables for the project, create a `.env` file in the root directory of each component (`backend`, `slug-service`, etc.). You can use the provided `.env.example` in each of the component folder as a reference:

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

4. **GET /download/csv**
   - **URL**: `http://localhost:8080/download/csv`
   - **Method**: GET
   - **Headers**: The response should have the `Content-Type` as `text/csv` and `Content-Disposition` as `attachment;filename=shortened_urls.csv`.
   - **Expected CSV**: The CSV file will contain the following columns:
     ```
     Slug,Original URL,Visit Count,Created At
     ```

### Step 2: Test Slug-Service Endpoints

1. **GET /generate-slug**
   - **URL**: `http://localhost:8081/generate-slug`
   - **Method**: GET
   - **Expected Response**:
     ```json
     {
       "slug": "abc123"
     }
     ```
     *Note*: The `slug` value will be a randomly generated string of 6 characters.


## Deploying to GCP using Terraform

This project can be deployed on Google Cloud Platform (GCP) using Terraform. Below are the instructions for pushing Docker images and running Terraform.

### Step 0: Prerequisites for GCP

Before deploying to GCP, ensure you have the following:

- **Google Cloud SDK:** Installed and configured.
- **Terraform:** Installed.
- **Docker:** Installed and configured.
- **psql or SQL Client (Optional):** For interacting with the PostgreSQL database directly.

### Step 1: Setting Up GCP

1. Create a new GCP Project:
   - Go to the [GCP Console](https://console.cloud.google.com/), and create a new GCP project.
   - Example: `url-shortener-project-438318`.
   - Once the project is created, note the project ID, as you will need it for setting up Terraform.

   **Important Notes:**
   - Project region is currently hard coded to `us-central1`, it is possible to manually change this in `main.tf` but it's recommended to simply use `us-central1`

2. Enable Billing:
   - Ensure that billing is enabled for your project so you can use Google Cloud services.

3. Create a Service Account & Download the Key:
   - In the GCP Console, navigate to **IAM & Admin** > **Service Accounts**.
   - Create a new service account for your project.
   - Assign appropriate roles to the service account (e.g., **Cloud Run Admin**, **Storage Admin**, **Cloud SQL Admin**).
   - Once the service account is created, generate a key in JSON format.
   - Download the key file and save it as `gcp-key.json` in your project directory.

4. Enable Necessary APIs in GCP:
   - Compute Engine API: Required for provisioning virtual machines.
   - Cloud Run API: Required for deploying containerized applications.
   - Cloud SQL Admin API: Required for managing PostgreSQL instances.
   - Artifact Registry API: Required for storing and retrieving container images.

5. Authenticate using the service account key file:
   ```sh
   export GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"
   gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
   ```

### Step 2: Set Project ID

Before running Terraform, you need to specify your GCP project ID. This is done by creating a `terraform.tfvars` file.

In the root directory of your project (where your Terraform configuration files are located), create a file named `terraform.tfvars`.  You may use the `terraform.tfvars.example` file as a template.

Add the following content to `terraform.tfvars`:
```sh
project_id = "your-google-cloud-project-id"
```
**Important Notes:**

- Do Not Commit `terraform.tfvars` to Version Control: This file contains your project ID.

### Step 3: Pre-Build and Push Docker Images
The Terraform configuration uses custom Docker images that need to be pushed to Artifact Registry prior to running Terraform. Use the `docker_push.sh` script to push the Docker images after building them.

#### Configuring Artifact Registry
1. Set Up an Artifact Registry Repository
   - Create a Docker repository in Artifact Registry named `url-shortener`.
   - Note the repository location (e.g., `us-central1-docker.pkg.dev`).
   
   **Important Notes:**
   - Since the project is hardcoded to `us-central1` in `main.tf`, it is highly recommended to keep the repository in the same region.

2. Authenticate Docker with Artifact Registry
   ```sh
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

#### Building Docker Images Locally

Before running `docker_push.sh`, ensure you've built the Docker images if you haven't already.  

If you are running and testing the project locally, then all image should have been built; if not, build them manually by running the following commands:

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

### Step 4: Running Terraform

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

**Important Notes:**

- If you have already deployed to GCP using terraform but have change the Docker image afterward, terraform will not automatically detect this change.  You must mark the image as `tainted` to allow redeployment.

   ```sh
   terraform taint google_cloud_run_service.frontend_instance
   terraform taint google_cloud_run_service.backend_service  
   terraform taint google_cloud_run_service.slug_service  
   ```

### Step 5: Initialize the Database
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

## Credit & Contact
- Author: Bill Yu
- Email: BillSoftwareEngineer@outlook.com

## License

This project is licensed under the MIT License.