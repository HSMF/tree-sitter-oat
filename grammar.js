module.exports = grammar({
  name: "oat",
  extras: ($) => [$.comment, /\s/],
  rules: {
    prog: ($) => repeat($.decl),
    decl: ($) => choice($.gdecl, $.fdecl, $.tdecl),
    fdecl: ($) => seq($.retty, $.id, "(", optional($.args), ")", $.block),
    gdecl: ($) => seq(named("global", $), $.id, "=", $.gexp, ";"),
    tdecl: ($) => seq(named("struct", $), $.Id, "{", sep($.field, ";"), "}"),
    field: ($) => seq($.t, $.id),
    arg: ($) => seq($.t, $.id),
    args: ($) => sep1($.arg, ","),
    block: ($) => seq("{", repeat($.stmt), "}"),
    t: ($) => prec.left(choice("int", "bool", $.ref, seq($.ref, "?"))),
    ref: ($) =>
      choice(
        "string",
        seq($.t, "[", "]"),
        $.Id,
        seq("(", sep($.t, ","), ")", "->", $.retty),
        seq("(", $.t, alias(")", ")"))
      ),
    F: ($) => seq("(", sep($.t, ","), ")", "->", $.retty),
    retty: ($) => prec.right(choice("void", $.t)),
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
      token.immediate(
        seq("\\", choice(/x[a-fA-F0-9]{2}/, /[0-7]{1,3}/, /[nr\\]/))
      ),

    gexp: ($) =>
      choice(
        $.integer,
        $.string,
        seq($.ref, named("null", $)),
        $.boolean,
        seq(
          optional(named("new", $)),
          $.t,
          "[",
          "]",
          "{",
          sep($.gexp, ","),
          "}"
        ),
        // this "optional" is following the specs but many test cases think it is
        seq(
          optional(named("new", $)),
          $.Id,
          "{",
          sep(seq($.id, "=", $.gexp), ";"),
          "}"
        ),
        $.id
      ),
    lhs: ($) =>
      choice(
        $.id,
        seq($.exp, "[", $.exp, "]"),
        seq($.exp, ".", $.id),
        $.function_call
      ),

    function_call: ($) =>
      prec.left(
        5,
        seq(field("func", $.exp), "(", field("args", sep($.exp, ",")), ")")
      ),
    boolean: (_) => choice("true", "false"),
    exp: ($) =>
      prec.left(
        10,
        choice(
          $.id,
          $.string,
          $.integer,
          seq($.ref, named("null", $)),
          $.boolean,
          seq($.exp, "[", $.exp, "]"),
          $.function_call,
          seq(
            named("new", $),
            $.t,
            "[",
            $.exp,
            "]",
            optional(seq("{", $.id, "->", $.exp, "}"))
          ),
          seq(named("new", $), $.t, "[", "]", "{", sep($.exp, ","), "}"),
          seq(
            optional(named("new", $)),
            $.Id,
            "{",
            sep($.field_init_exp, ";"),
            "}"
          ),
          seq($.exp, $.bop, $.exp),
          seq($.uop, $.exp),
          seq("(", $.exp, ")"),
          seq($.exp, ".", $.id)
        )
      ),
    field_init_exp: ($) => seq($.id, "=", $.exp),

    vdecl: ($) => seq(named("var", $), $.id, "=", $.exp),
    vdecls: ($) => sep1($.vdecl, ","),
    stmt: ($) =>
      prec.left(
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
        )
      ),

    if_stmt: ($) =>
      choice(
        seq(named("if", $), "(", $.exp, ")", $.block, optional($.else_stmt)),
        seq(
          alias("if?", $.if),
          "(",
          $.ref,
          $.id,
          "=",
          $.exp,
          ")",
          $.block,
          optional($.else_stmt)
        )
      ),
    else_stmt: ($) => seq(named("else", $), choice($.block, $.if_stmt)),

    id: (_) => /[a-z][a-zA-Z0-9_]*/,
    Id: (_) => /[A-Z][a-zA-Z0-9_]*/,
    comment: (_) =>
      token(
        choice(
          // seq("//", /(\\+(.|\r?\n)|[^\\\n])*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        )
      ),
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
