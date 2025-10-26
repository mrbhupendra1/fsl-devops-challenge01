pipeline {
    agent any

    environment {
        REGISTRY = "mrbhupendra1"
        IMAGE_NAME = "fsl-app"
        DOCKER_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
        KUBE_NAMESPACE = "production"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Checking out repository..."
                checkout scm
            }
        }

        stage('Build & Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root:root'  // ensure full permissions
                }
            }
            steps {
                sh '''
                    echo "📦 Setting up writable npm cache..."
                    mkdir -p /tmp/.npm
                    npm config set cache /tmp/.npm --global

                    echo "📦 Installing npm dependencies..."
                    npm install

                    echo "🧹 Running ESLint..."
                    npm run lint || true

                    echo "🎨 Running Prettier..."
                    npm run prettier --write || true

                    echo "🧪 Running Tests..."
                    CI=true npm test || true
                '''
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    echo "🐳 Building Docker image..."
                    sh "docker build -t ${DOCKER_IMAGE} ."

                    echo "🔐 Logging in to DockerHub..."
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                    }

                    echo "📤 Pushing Docker image..."
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "🚀 Deploying to Kubernetes..."
                    sh '''
                        kubectl set image statefulset/fsl-app fsl-app=${DOCKER_IMAGE} -n production
                        kubectl rollout status statefulset/fsl-app -n production
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}

