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
(function_call (id) @function)

(gdecl
  (id) @variable
)
(vdecl
  (id) @variable
)
(id) @variable

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
] @keyword
