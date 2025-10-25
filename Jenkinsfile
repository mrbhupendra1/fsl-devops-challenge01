pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ECR_REPO = "627129177687.dkr.ecr.us-east-1.amazonaws.com/raja-fsl-app"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        K8S_NAMESPACE = "production"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $ECR_REPO:$IMAGE_TAG .'
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([aws(credentialsId: 'aws-creds', region: "${AWS_REGION}")]) {
                    sh '''
                        aws ecr get-login-password --region $AWS_REGION | \
                        docker login --username AWS --password-stdin $ECR_REPO
                    '''
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                script {
                    sh 'docker push $ECR_REPO:$IMAGE_TAG'
                }
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/secret.yaml
                        kubectl apply -f k8s/service.yaml
                        kubectl apply -f k8s/statefulset.yaml
                    '''
                }
            }
        }

