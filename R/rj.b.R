
RjClass <- R6::R6Class(
    "RjClass",
    inherit = RjBase,
    private = list(
        .run = function() {
            
            code <- self$options$code
            
            if (self$options$R == 'bundled') {
                
                eval(code, self$data, self$results)
                
            } else {
                
                scriptPath <- system.file('remote.R', package='Rj', mustWork=TRUE)
                outputPath <- tempfile()
                
                script <- readLines(scriptPath)
                script <- paste0(script, collapse='\n');
                script <- sub('{{CODE}}', code, script, fixed=TRUE)
                script <- sub('{{DATASET}}', .datasetPath, script, fixed=TRUE)
                script <- sub('{{OUTPATH}}', outputPath, script, fixed=TRUE)
                
                R <- private$.findR()
                Sys.setenv(R_LIBS="something-which-doesnt-exist")
                
                result <- system2(
                    command=R,
                    args=c(
                        '--no-save',
                        '--no-restore',
                        '--slave'),
                    stdout=TRUE,
                    stderr=TRUE,
                    input=script)

                for (line in result) {
                    if (startsWith(line, 'ERROR: ')) {
                        stop(substring(line, 7), call.=FALSE)
                    }
                    if (line == 'OK') {
                        results <- readRDS(file=outputPath)
                        for (item in results$items)
                            self$results$add(item)
                    }
                }
                
                unlink(outputPath)

                # options <- jmvcore::Options$new();
                # text <- jmvcore::Preformatted$new(options, 'output');
                # self$results$add(text)
                # 
                # text$setContent(result)
            }
            
        },
        .render=function(image, ...) {
            print(image$state)
            TRUE
        },
        .findR=function() {
            
            os <- Sys.info()[['sysname']]
            
            if (os == 'Darwin') {
                version <- Sys.readlink('/Library/Frameworks/R.framework/Versions/Current')
                path <- file.path('/Library/Frameworks/R.framework/Versions', version)
                path <- file.path(path, 'Resources', 'bin', 'R')
                
                if (file.exists(path))
                    return(path)
                if (file.exists('/usr/bin/R'))
                    return('/usr/bin/R')
                if (file.exists('/usr/local/bin/R'))
                    return('/usr/local/bin/R')
                if (file.exists('/opt/local/bin/R'))
                    return('/opt/local/bin/R')
                
                stop('Could not find system R')
            }
        }),
    public=list(
        asSource=function() '')
)
