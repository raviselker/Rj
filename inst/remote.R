
reportError <- function(result) {
    error <- attr(result, 'condition')
    if ( ! is.null(error$message)) {
        message <- stringi::stri_encode(error$message, to='utf-8')
        cat('ERROR:', message)
    } else {
        cat('ERROR: Unknown error')
    }
}

result <- try({
    
    if ( ! requireNamespace('jmvc', quietly=TRUE))
        stop('To use the system R from jamovi, jmvc must be installed', call.=FALSE)
    
    if (packageVersion('jmvc') < '1.0.0')
        stop('To use the system R from jamovi, a newer version of jmvc is required', call.=FALSE)

}, silent=TRUE)

if (inherits(result, 'try-error')) {
    reportError(result)
} else {
    result <- try(jmvc:::evalRemote("{{CODE}}", "{{DATASET}}", "{{OUTPATH}}"), silent=TRUE)
    if (inherits(result, 'try-error')) {
        reportError(result)
    } else {
        cat('OK')
    }
}

