
eval <- function(script, data, root) {
    
    eval.env <- new.env()
    
    if ( ! missing(data))
        eval.env$data <- data
    
    env <- new.env()
    env$count <- 1
    options <- jmvcore::Options$new()
    
    if (missing(root))
        root <- jmvcore::Group$new(options, title="Results")
    
    text_handler <- function(object) {
        
        results <- jmvcore::Preformatted$new(options, paste(env$count))
        env$count <- env$count + 1
        env$last <- NULL
        root$add(results)
        
        if (inherits(object, 'ResultsElement')) {
            object$print()
            value <- object$asString()
        }
        else {
            value <- capture.output(object)
        }
        
        results$setContent(value)
        
        object
    }
    
    source_handler <- function(value) {
        value <- trimws(value$src)
        if (value == '')
            return()
        
        if (is.null(env$last) || ! is(env$last, 'Preformatted')) {
            results <- jmvcore::Preformatted$new(options, paste(env$count))
            root$add(results)
            env$count <- env$count + 1
        }
        else {
            results <- env$last
        }
        
        value <- paste0('> ', value)
        
        content <- results$content
        if (content != '')
            content <- paste0(content, '\n', value)
        else
            content <- value
        
        results$setContent(content)
        env$last <- results
    }
    
    graphics_handler <- function(plot) {
        results <- jmvcore::Image$new(
            options=options,
            name=paste(env$count),
            renderFun='.render')
        root$add(results)
        results$setState(plot)
        env$count <- env$count + 1
        env$last <- NULL
    }
    
    handler <- evaluate::new_output_handler(
        source=source_handler,
        value=text_handler,
        graphics=graphics_handler)
    
    evaluate::evaluate(
        input=script,
        envir=eval.env,
        output_handler=handler,
        stop_on_error=2)
    
    root
}

