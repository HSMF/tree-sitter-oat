[
  (t)
  (ref)
  (retty)
] @type

(integer) @number
(string) @string

[
  (boolean)
  (null)
] @constant.builtin

(gdecl
  (id) @variable
)
(vdecl
  (id) @variable
)

(fdecl (id) @function)
(function_call (id) @function)


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
