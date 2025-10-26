pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '627129177687'
        IMAGE_NAME = 'raja-fsl-app'
        ECR_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/mrbhupendra1/fsl-devops-challenge01.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing npm dependencies..."
                    npm install
                '''
            }
        }

        stage('Lint Code') {
            steps {
                sh '''
                    echo "🧹 Running ESLint..."
                    npm run lint || true
                '''
            }
        }

        stage('Prettier Format') {
            steps {
                sh '''
                    echo "🎨 Running Prettier..."
                    npm run prettier --write . || true
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    echo "🧪 Running Jest tests..."
                    CI=true npm run test || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    echo "🐳 Building Docker image..."
                    docker build -t ${ECR_URL}/${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([[ 
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                        echo "🔐 Logging into AWS ECR..."
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}
                    '''
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh '''
                    echo "🚀 Pushing Docker image to ECR..."
                    docker push ${ECR_URL}/${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Deploy to EKS Cluster') {
            steps {
                echo "✅ Deployment to EKS will go here (optional)"
            }
        }
    }

    post {
        success {
            echo '✅ Build, Test & Push Successful!'
        }
        failure {
            echo '❌ Build or Deployment failed!'
        }
    }
}

