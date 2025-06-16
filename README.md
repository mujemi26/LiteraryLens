# 📚 LiteraryLens DevOps Deployment Guide

Welcome to the **LiteraryLens** deployment guide! This document provides a step-by-step walkthrough for deploying a Literary Lens App using Docker, Jenkins, Kubernetes (EKS), and monitoring with Prometheus & Grafana.

---
![Diagram](screenshots/literarylens-Diagram.png)
The pipeline begins when a developer pushes code to GitHub, triggering Jenkins to start the CI/CD process. Jenkins first runs code quality checks using SonarQube and then performs a security scan of project dependencies using OWASP Dependency Check. If everything passes, Jenkins builds a Docker image of the application, which is then scanned for container vulnerabilities using Trivy. The secure image is deployed to a Kubernetes cluster. Prometheus monitors the application's performance, Grafana visualizes the metrics, and the developer receives email notifications about the pipeline status.

## 🗂️ Table of Contents

1. [🚀 Project Overview](#-project-overview)
2. [🖥️ Infrastructure Setup](#-infrastructure-setup)
3. [🐳 Docker Deployment](#-docker-deployment)
4. [🔧 Tools Installation](#-tools-installation)
5. [🤖 Jenkins Pipeline Setup](#-jenkins-pipeline-setup)
6. [☸️ Kubernetes (EKS) Deployment](#️-kubernetes-eks-deployment)
7. [📈 Monitoring with Prometheus & Grafana](#-monitoring-with-prometheus--grafana)
8. [📬 Email Integration](#-email-integration)
9. [🧹 Cleanup](#-cleanup)


---

## 🚀 Project Overview

**LiteraryLens** is a modern, community-driven web application for discovering, reviewing, and rating books. This guide will help you deploy the app using best DevOps practices, including CI/CD, containerization, orchestration, and monitoring.

---
![Website](screenshots/Literarylens.png) 

## 🖥️ Infrastructure Setup

### 1️⃣ Launch VM for App & Jenkins

- **OS:** Ubuntu 24.04
- **Instance Type:** t2.large (28 GB)
- **Name:** `LS-Server`
![Website](screenshots/ec2-instances.png) 
#### 🔓 Open Required Ports

| Type         | Protocol | Port(s)         | Purpose                                   |
|--------------|----------|-----------------|-------------------------------------------|
| SMTP         | TCP      | 25              | Email sending                             |
| Custom TCP   | TCP      | 3000-10000      | Node.js, Grafana, Jenkins, custom apps    |
| HTTP         | TCP      | 80              | Web traffic                               |
| HTTPS        | TCP      | 443             | Secure web traffic                        |
| SSH          | TCP      | 22              | Remote server access                      |
| Custom TCP   | TCP      | 6443            | Kubernetes API server                     |
| SMTPS        | TCP      | 465             | Secure email (SMTP over SSL/TLS)          |
| Custom TCP   | TCP      | 30000-32767     | Kubernetes NodePort service range         |

---

## 🐳 Docker Deployment

### 2️⃣ EKS Cluster Setup

#### 👤 IAM User Creation

- Create a new IAM user (not root).
- Attach these policies:
  - `AmazonEC2FullAccess`
  - `AmazonEKS_CNI_Policy`
  - `AmazonEKSClusterPolicy`
  - `AmazonEKSWorkerNodePolicy`
  - `AWSCloudFormationFullAccess`
  - `IAMFullAccess`
- Add this inline policy:
  ```json
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "eks:*",
              "Resource": "*"
          }
      ]
  }
  ```
- Create access keys for this user.

#### 🏗️ EKS Cluster Creation

1. **Connect to LS-Server VM**
   ```bash
   sudo apt update
   ```

2. **Install AWS CLI**
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   sudo apt install unzip
   unzip awscliv2.zip
   sudo ./aws/install
   aws configure
   ```

3. **Install kubectl**
   ```bash
   curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
   chmod +x ./kubectl
   sudo mv ./kubectl /usr/local/bin
   kubectl version --short --client
   ```

4. **Install eksctl**
   ```bash
   curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
   sudo mv /tmp/eksctl /usr/local/bin
   eksctl version
   ```

5. **Create EKS Cluster**
   ```bash
   eksctl create cluster --name=mujimmy-eks \
                         --region=us-east-1 \
                         --zones=us-east-1a,us-east-1b \
                         --version=1.30 \
                         --without-nodegroup
   ```

6. **Associate IAM OIDC Provider**
   ```bash
   eksctl utils associate-iam-oidc-provider \
       --region us-east-1 \
       --cluster mujimmy-eks \
       --approve
   ```

7. **Create Node Group**
   ```bash
   eksctl create nodegroup --cluster=mujimmy-eks \
                          --region=us-east-1 \
                          --name=node2 \
                          --node-type=t3.medium \
                          --nodes=3 \
                          --nodes-min=2 \
                          --nodes-max=4 \
                          --node-volume-size=20 \
                          --ssh-access \
                          --ssh-public-key=Kastro \
                          --managed \
                          --asg-access \
                          --external-dns-access \
                          --full-ecr-access \
                          --appmesh-access \
                          --alb-ingress-access
   ```

---

## 🔧 Tools Installation

### 3️⃣ Jenkins Installation

```bash
# Jenkins install script
sudo apt install openjdk-17-jre-headless -y
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins -y
```
- Open port 8080 for Jenkins.
- Access Jenkins at `http://<server-ip>:8080`.
![Website](screenshots/Jenkins-build.png) 
### 4️⃣ Docker Installation

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
- Test Docker: `docker --version`
- Pull test image: `docker pull hello-world`
- If permission denied: `sudo chmod 666 /var/run/docker.sock`

### 5️⃣ Trivy Installation

```bash
sudo apt-get install wget apt-transport-https gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
trivy --version
```

### 6️⃣ SonarQube Setup

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
```
- Access SonarQube at `http://<server-ip>:9000`
- Default credentials: `admin` / `admin`
![Website](screenshots/SonarQube-Result.png) 
---

## 🤖 Jenkins Pipeline Setup

### 7️⃣ Install Jenkins Plugins

- Eclipse Temurin Installer
- SonarQube Scanner
- NodeJS
- Docker, Docker Commons, Docker Pipeline, Docker API, docker-build-step
- OWASP Dependency Check
- Pipeline Stage View
- Email Extension Template
- Kubernetes, Kubernetes CLI, Kubernetes Client API, Kubernetes Credentials
- Config File Provider
- Prometheus metrics

### 8️⃣ SonarQube Token

- Generate a token in SonarQube (e.g., `squ_69eb05b41575c699579c6ced901eaafae66d63a2`)
- Configure SonarQube server in Jenkins.

### 9️⃣ Jenkins Credentials & Tools

- Add DockerHub, SonarQube, and email credentials in Jenkins.
- Configure NodeJS and JDK tools.

### 🔗 Example Jenkins Pipeline (Docker Only)

```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('Clean Workspace') { steps { cleanWs() } }
        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/mujemi26/LiteraryLens.git'
                sh 'ls -la'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh ''' 
                    $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=ls -Dsonar.projectKey=ls 
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh '''
                cd literarylens_app
                ls -la
                if [ -f package.json ]; then
                    rm -rf node_modules package-lock.json
                    npm install
                else
                    echo "Error: package.json not found in literarylens_app!"
                    exit 1
                fi
                '''
            }
        }
        stage('Trivy FS Scan') { steps { sh 'trivy fs . > trivyfs.txt' } }
        stage('Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh ''' 
                        docker build --no-cache -t mujimmy/ls:latest -f literarylens_app/Dockerfile literarylens_app
                        docker push mujimmy/ls:latest
                        '''
                    }
                }
            }
        }
        stage('Deploy to Container') {
            steps {
                sh ''' 
                docker stop ls || true
                docker rm ls || true
                docker run -d --restart=always --name ls -p 3000:3000 mujimmy/ls:latest
                docker ps -a
                sleep 5
                docker logs ls
                '''
            }
        }
    }
    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>URL: ${env.BUILD_URL}<br/>",
                to: 'your-email@example.com',
                attachmentsPattern: 'trivyfs.txt'
        }
    }
}
```

---

## ☸️ Kubernetes (EKS) Deployment

### 🔗 Example Jenkins Pipeline (With K8S Stage)

```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = 'mujimmy/ls:latest'
        EKS_CLUSTER_NAME = 'mujimmy-eks'
        AWS_REGION = 'us-east-1'
    }
    stages {
        // ...existing stages...
        stage('Deploy to EKS Cluster') {
            steps {
                script {
                    sh '''
                    aws sts get-caller-identity
                    aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION
                    kubectl config view
                    kubectl apply -f deployment.yml
                    kubectl apply -f service.yml
                    kubectl get pods
                    kubectl get svc
                    '''
                }
            }
        }
    }
    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>URL: ${env.BUILD_URL}<br/>",
                to: 'your-email@example.com',
                attachmentsPattern: 'trivyfs.txt'
        }
    }
}
```

---

## 📈 Monitoring with Prometheus & Grafana

### 1️⃣ Prometheus Setup

- **Create Monitoring VM:** Ubuntu 22.04, t2.medium
- **Create Prometheus user:**
  ```bash
  sudo useradd --system --no-create-home --shell /bin/false prometheus
  ```
- **Download & Install Prometheus:**
  ```bash
  sudo wget https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz
  tar -xvf prometheus-2.47.1.linux-amd64.tar.gz
  sudo mkdir -p /data /etc/prometheus
  cd prometheus-2.47.1.linux-amd64/
  sudo mv prometheus promtool /usr/local/bin/
  sudo mv consoles/ console_libraries/ /etc/prometheus/
  sudo mv prometheus.yml /etc/prometheus/prometheus.yml
  sudo chown -R prometheus:prometheus /etc/prometheus/ /data/
  ```
- **Create systemd service:**
  ```ini
  [Unit]
  Description=Prometheus
  Wants=network-online.target
  After=network-online.target
  StartLimitIntervalSec=500
  StartLimitBurst=5
  [Service]
  User=prometheus
  Group=prometheus
  Type=simple
  Restart=on-failure
  RestartSec=5s
  ExecStart=/usr/local/bin/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/data \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.listen-address=0.0.0.0:9090 \
    --web.enable-lifecycle
  [Install]
  WantedBy=multi-user.target
  ```
- **Enable & Start:**
  ```bash
  sudo systemctl enable prometheus
  sudo systemctl start prometheus
  sudo systemctl status prometheus
  ```

### 2️⃣ Node Exporter

- **Create user & install:**
  ```bash
  sudo useradd --system --no-create-home --shell /bin/false node_exporter
  wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
  tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz
  sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
  rm -rf node_exporter*
  ```
- **Create systemd service:**
  ```ini
  [Unit]
  Description=Node Exporter
  Wants=network-online.target
  After=network-online.target
  StartLimitIntervalSec=500
  StartLimitBurst=5
  [Service]
  User=node_exporter
  Group=node_exporter
  Type=simple
  Restart=on-failure
  RestartSec=5s
  ExecStart=/usr/local/bin/node_exporter --collector.logind
  [Install]
  WantedBy=multi-user.target
  ```
- **Enable & Start:**
  ```bash
  sudo systemctl enable node_exporter
  sudo systemctl start node_exporter
  sudo systemctl status node_exporter
  ```

### 3️⃣ Prometheus Scrape Config

Edit `/etc/prometheus/prometheus.yml` and add:
```yaml
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['<MonitoringVMip>:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['<jenkins-ip>:<jenkins-port>']
```
- Validate config: `promtool check config /etc/prometheus/prometheus.yml`
- Reload: `curl -X POST http://localhost:9090/-/reload`
- Open Prometheus at `http://<monitoring-ip>:9090/targets`
![Website](screenshots/prometheus.png) 
### 4️⃣ Grafana Installation

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get -y install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
sudo systemctl status grafana-server
```
- Access Grafana at `http://<monitoring-ip>:3000` (default: admin/admin)
- Add Prometheus as a data source.
- Import dashboards:
  - [Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)
  - [Jenkins Performance](https://grafana.com/grafana/dashboards/9964-jenkins-performance-and-health-overview/)

![Website](screenshots/Grafana%20Dashboard.png)
![Website](screenshots/Grafana%20Jenkins.png)
![Website](screenshots/Grafana%20Node%20exporter%20.png)   
---

## 📬 Email Integration

- Generate an App Password in Gmail for Jenkins.
- Add credentials in Jenkins (`email-creds`).
- Configure SMTP in Jenkins:
  - SMTP Server: `smtp.gmail.com`
  - Port: `465`
  - Use SSL
  - Use SMTP Authentication
  - Username: your email
  - Password: App Password
- Test configuration and set triggers for build notifications.

---

## 📬 Check Deployment , Service and Pods
```bash
kubectl get pods
kubectl get svc
kubectl get deployments
```
![Website](screenshots/get%20nodes.png)
![Website](screenshots/get%20pods.png)
![Website](screenshots/get%20svc.png)
![Website](screenshots/get%20deployments.png) 


---

## 🧹 Cleanup

When finished, remember to delete all cloud resources to avoid unnecessary charges.

---

**Happy Deploying!** 🚀📚✨
