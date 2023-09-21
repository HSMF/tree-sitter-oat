module.exports = grammar({
  name: "oat",
  extras: ($) => [$.comment, /\s/],
  rules: {
    prog: ($) => repeat($.decl),
    decl: ($) => choice($.gdecl, $.fdecl),
    fdecl: ($) => seq($.retty, $.id, "(", optional($.args), ")", $.block),
    gdecl: ($) => seq(named("global", $), $.id, "=", $.gexp, ";"),
    arg: ($) => seq($.t, $.id),
    args: ($) => sep1($.arg, ","),
    block: ($) => seq("{", repeat($.stmt), "}"),
    t: ($) => prec(1000, choice("int", "bool", $.ref)),
    ref: ($) => choice("string", seq($.t, "[", "]")),
    F: ($) => seq("(", sep($.t, ","), ")", "->", $.retty),
    retty: ($) => choice("void", $.t),
    bop: (_) =>
      choice(
        prec.left(100, "*"),
        prec.left(90, "+"),
        prec.left(90, "-"),
        prec.left(80, "<<"),
        prec.left(80, ">>"),
        prec.left(80, ">>>"),
        prec.left(70, "<"),
        prec.left(70, "<="),
        prec.left(70, ">"),
        prec.left(70, ">="),
        prec.left(60, "=="),
        prec.left(60, "!="),
        prec.left(50, "&"),
        prec.left(40, "|"),
        prec.left(30, "[&]"),
        prec.left(20, "[|]")
      ),
    uop: (_) => choice("-", "!", "~"),
    integer: (_) => /\d+/,
    string: ($) => seq('"', repeat(choice($.unescaped, $.escape_seq)), '"'),
    unescaped: (_) => token.immediate(prec(1, /[^"\\]+/)),
    escape_seq: (_) =>
      token.immediate(seq("\\", choice(
        /x[a-fA-F0-9]{2}/, 
        /[0-7]{1,3}/,
        /[nr\\]/
      ))),

    gexp: ($) =>
      choice(
        $.integer,
        $.string,
        seq($.ref, named("null", $)),
        $.boolean,
        seq(named("new", $), $.t, "[", "]", "{", sep($.gexp, ","), "}")
      ),
    lhs: ($) => choice($.id, seq($.exp, "[", $.exp, "]")),

    function_call: ($) => seq($.id, "(", sep($.exp, ","), ")"),
    boolean: (_) => choice("true", "false"),
    exp: ($) =>
      prec.left(
        choice(
          $.id,
          $.string,
          $.integer,
          seq($.ref, named("null", $)),
          $.boolean,
          seq($.exp, "[", $.exp, "]"),
          $.function_call,
          seq(named("new", $), $.t, "[", "]", "{", sep($.gexp, ","), "}"),
          seq(named("new", $), "int", "[", $.exp, "]"),
          seq(named("new", $), "bool", "[", $.exp, "]"),
          seq($.exp, $.bop, $.exp),
          seq($.uop, $.bop),
          seq("(", $.exp, ")")
        )
      ),

    vdecl: ($) => seq(named("var", $), $.id, "=", $.exp),
    vdecls: ($) => sep1($.vdecl, ","),
    stmt: ($) =>
      choice(
        seq($.lhs, "=", $.exp, ";"),
        seq($.vdecl, ";"),
        seq(named("return", $), $.exp, ";"),
        seq(named("return", $), ";"),
        seq($.function_call, ";"),
        $.if_stmt,
        seq(
          named("for", $),
          "(",
          optional($.vdecls),
          ";",
          optional($.exp),
          ";",
          optional($.stmt),
          ")",
          $.block
        ),
        seq(named("while", $), "(", $.exp, ")", $.block)
      ),

    if_stmt: ($) =>
      seq(named("if", $), "(", $.exp, ")", $.block, optional($.else_stmt)),
    else_stmt: ($) => seq(named("else", $), choice($.block, $.if_stmt)),

    id: (_) => /[a-zA-Z_]\w*/,

    comment: (_) => seq("//", /.*/),
  },
});

/**
 *
 * @param {string} rule
 * */
function named(rule, $) {
  return alias(rule, $[rule]);
}

function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}

function sep(rule, separator) {
  return optional(sep1(rule, separator));
}
