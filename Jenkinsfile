node {
    checkout scm

    withEnv([
        "compile=true",
        "init=true",
        "aa=1",
        "bb='helloworld'",
        "cc=true",
        "dd='true'"
    ]) {
        echo "-------------------"
        echo "aa=$aa"
        echo "env.bb=${env.bb}"
        echo "env.bb=${bb}"
        echo "env.cc=${env.cc}"
        echo "env.dd.toString().toBoolean()=${env.dd.toString().toBoolean()}"

        echo "aa==1...${aa==1?true:false}"
        echo "bb.equals('helloworld')...${bb.equals('helloworld')}"
        echo "bb=='helloworld'...${bb=='helloworld'}"
        echo "bb.trim()=='helloworld'...${bb.trim()=='helloworld'}"
        echo "cc==true...${cc==true?true:false}"
        echo "-------------------"
        if($env.bb=='helloworld'){
          echo  "if env.bb=='helloworld'"
        }
        echo "-------------------"
        sh "printenv"
        if(env.compile.toBoolean()){
            stage('Build') {
                ansiColor('vga'){
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

                // 初始化
                if(env.init.toBoolean()){
                    echo "初始化"
                    sshPublisher(publishers: [
                            sshPublisherDesc(configName: '192.168.108.81(prod)', transfers: [
                            sshTransfer(cleanRemote: false, excludes: '',
                            execCommand:
                            '''
                                cd /data/dockerapp/spark-admin
                                docker-compose rm -svfa nginx
                                rm data/ -rf
                                docker-compose up -d nginx
                                sleep 60
                            ''',
                            execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+',
                            remoteDirectory: '',
                            remoteDirectorySDF: false,
                            // removePrefix: 'target',
                            sourceFiles: '')
                        ], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true)
                    ])
                }

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





}
