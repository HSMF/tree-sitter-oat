[
  (t)
  (ref)
  (retty)
] @type

(integer) @number
(string) @string
(escape_seq) @string.escape

[
  (boolean)
  (null)
] @constant.builtin

(fdecl (id) @function)
(function_call func:(exp (id)) @function)

(gdecl
  (id) @variable
)
(vdecl
  (id) @variable
)

(Id) @type

[
  (bop)
  (uop)
] @operator

[
  (global)
  (return)
  (while)
  (for)
  (if)
  (else)
  (var)
  (new)
  (struct)
] @keyword

(comment) @comment

(ERROR) @error
