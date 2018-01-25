pipeline {
    agent any

    environment {
        DM_BIN = "${env.JENKINS_HOME}/bin"
        DM    = "${env.JENKINS_HOME}/bin/dm"
        BUILD_ID    = "${env.GIT_HASH}"
        VOL_ID    = "${env.GIT_HASH}"
        REMOTE_ID    = "ciexample/ci-example"
    }

    stages {
        stage('dm') {
            steps {
                withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'DOTHUB_API_KEY', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                    // this install soon to be replaced by a docker run command
                    sh 'mkdir -p $DM_BIN && curl -L -o $DM https://get.dotmesh.io/$(uname -s)/dm && chmod +x $DM'
                    sh '$DM cluster init'
                    sh 'echo $PASSWORD | $DM remote add dothub $USERNAME'
                }
            }
        }
        stage('build') {
            steps {
                sh 'make build'
            }
        }
        stage('test') {
            steps {
                sh 'make test'
            }
        }
    }
    post {
        always {
            sh '$DM switch ${VOL_ID}  && $DM commit -m "CI run $(date)" && $DM push dothub --remote-name ${REMOTE_ID}"
        }
    }
}

