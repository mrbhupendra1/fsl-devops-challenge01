pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "627129177687"
        AWS_REGION = "us-east-1"
        ECR_REPO_NAME = "raja-fsl-app"
        IMAGE_TAG = "latest"
        K8S_NAMESPACE = "production"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/mrbhupendra1/fsl-devops-challenge01.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Format Code') {
            steps {
                sh 'npm run prettier -- --write || true'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'CI=true npm run test || true'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                script {
                    try {
                        sh """
                        echo "🔹 Applying StatefulSet configuration..."
                        kubectl apply -f k8s/statefulset.yaml -n ${K8S_NAMESPACE}

                        echo "🔹 Updating StatefulSet image..."
                        kubectl set image statefulset/fsl-app app=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG} -n ${K8S_NAMESPACE}

                        echo "🔹 Restarting StatefulSet..."
                        kubectl rollout restart statefulset/fsl-app -n ${K8S_NAMESPACE}

                        echo "✅ Deployment successful!"
                        """
                    } catch (err) {
                        echo "❌ Deployment failed! Check logs."
                        error("Deployment failed.")
                    }
                }
            }
        }
    }
}
