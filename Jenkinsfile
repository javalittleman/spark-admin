node {
  checkout scm
  def compile=true
  def init=true

  if(compile){
    stage('Build') {
      ansiColor('vga'){
        echo "编译"
          docker.image('node:12').inside() {
              sh 'npm install --registry=https://registry.npm.taobao.org && npm run build:prod'
          }
      }
      // ansiColor('vga'){
      //     docker.image('maven:3.3.3').inside('-v /data/maven/repo:/root/.m2 -v /etc/localtime:/etc/localtime -v $WORKSPACE/settings.xml:/usr/share/maven/conf/settings.xml -e TZ=Asia/Shanghai') {
      //         sh 'mvn -DskipTests clean package'
      //     }
      // }

      // ansiColor('vga'){
      //     docker.image('gradle').inside('-v /etc/localtime:/etc/localtime -e TZ=Asia/Shanghai') {
      //         sh 'gradle clean build -x test'
      //     }
      // }
    }

    // stage('Build') {
    //     ansiColor('vga'){
    //         if (isUnix()) {
    //             echo "\033[5;30;42mLinux\033[0m system"
    //             sh 'mvn -Dmaven.test.failure.ignore -DskipTests clean package'
    //         } else {
    //             echo "\033[5;30;42mWindows\033[0m system"
    //             bat(/mvn -Dmaven.test.failure.ignore -DskipTests clean package/)
    //         }
    //     }
    // }

  }

  stage('Deploy') {

    ansiColor('vga'){

      // 停止应用，为传输打包文件做准备
      echo "停止应用，为传输打包文件做准备"
      sshPublisher(publishers: [
              sshPublisherDesc(configName: '192.168.108.81(prod)', transfers: [
              sshTransfer(cleanRemote: false, excludes: '',
              execCommand:
              '''
                  cd /data/dockerapp/spark-admin
                  docker-compose rm -svfa nginx
              ''',
              execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+',
              remoteDirectory: '',
              remoteDirectorySDF: false,
              // removePrefix: 'target',
              sourceFiles: '')
          ], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true)
      ])

      // 传输打包文件并启动应用
      echo "传输打包文件并启动应用"
      sshPublisher(publishers: [
              sshPublisherDesc(configName: '192.168.108.81(prod)', transfers: [
              sshTransfer(cleanRemote: false, excludes: '',
              execCommand:
              '''
                  cd /data/dockerapp/spark-admin
                  docker-compose up -d nginxz
              ''',
              execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+',
              remoteDirectory: '/data/dockerapp/spark-admin',
              remoteDirectorySDF: false,
              // removePrefix: 'target',
              // sourceFiles: '**/*.jar,docker*.*,**/*.sql')
              sourceFiles: 'dist/**')
          ], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true)
      ])

      echo "构建成功！！！"
      echo "站点：\033[45mhttp://prod.y.com:8088/\033[0m"

    }

  }

  stage('Results') {
      archiveArtifacts 'dist/**'
  }


}
