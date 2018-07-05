
RjClass <- R6::R6Class(
    "RjClass",
    inherit = RjBase,
    private = list(
        .run = function() {
            code <- self$options$code
            jmvcore::evalR(code, self$data, self$results)
        },
        .render=function(image, ...) {
            print(image$state)
            TRUE
        }),
    public=list(
        asSource=function() '')
)
