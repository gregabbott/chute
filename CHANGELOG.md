# 2024_12_08
- Site: Simplifies auto-generated section target hashes.
- JS: Renames "if" to "pick" for ".pick({if:[],else_if…})".
- JS: Improves skip void setting handler.
- DOCS: Removes "pick" shorthand section.  ".pick(if,then)".
- Site: Loads log from text file.

# 2024_12_07.2
- JS: Adds and documents chute end methods "._end()" or "._$()".
- Docs: Documents option to give Chute a custom name e.g. "$()".
- Docs: Orders and nests documentation. 
- Docs: Adds summaries to some section headers.
- Adds "Path" option: treat dots as paths vs set of instructions
- Docs: Documents "path" option
- Site: Scrolls to hash targets loaded separately to the page.

# 2024_12_06 (10KB)
- DOCS: Updates most documentation.
- SCRIPT: Cleans and slims script.
- SITE: Adds header levels to dynamic sections.

# 2024_12_05
- +js Adds LIFT.
- +js Lift makes function libraries available across all chutes.
- +js Lift makes lib.function() directly callable: function().
- +docs Updates documentation.
- +site Creates a TOC dynamically, with jump links.

# 2024_12_04
- Memoizes non-global Fns seen for dot-style use in same chute.
- Adds FEED: load function libraries for use across all chutes.
- Documents and demonstrates feed option.
- Allows calling unary functions & data methods without '()'.
- If given index e.g. [4], will look for method at that index.
- Merges ".if" block logic on backend.
- Refactors backend.

# 2024_12_03
- SCRIPT
  - Adds access to custom / non-native methods of current data.
  - Looks within current data for nested functions.
  - Uses .call so Fns nested in current data keep context.
    - Some things like el.classList.add lose context otherwise.
  - Refactors chute .with method to take a settings object.
  - Syncs the current value to a variable using .token property.
  - Adds "skip_void" setting to ignore undefined calls returns.
  - Revises handling of access index feature "[0]".
- DOCS
  - Unifies documentation formatting.
  - Demonstrates access to global nested non-native functions.
  - Adds example of using Chute with DOM.
- SITE
  - Adds noscript message.
  - Updates styles.
  - Basic styling for log.

# 2024_12_02
- Styles site minimally.
- Merges 'if this then that' and 'if else' block. Both via .if.
- Updates documentation.
- Splits demo JS to file. Uses fetch to show it on main page.
- Refactors to enforce parens on all dot-style calls except [\d]
  - Calls DO when no key given e.g ".log()(<-NoKey==DoCall)"
- Adds nested namespace path style calling ".JSON.stringify()."
- Documents calls to nested function and native methods.

# 2024-12-01
- Adds token handler for a live local current data variable.
- Revises documentation.
- Improves if else block.
- Handles index calls, `[0]`

# 2024-11-30
- Adds stricter conditions to 'is if block' function.
- Memoizes all functions given as if or else if conditions.
- Cleans documentation.
- Refactors chute to chute allow for simultaneous chutes.

# 2024-11-29
- Renames built in '.and' method to '.do'.
- Accepts locally scoped functions via do call: ".do(local_fn)".
- Refactors internal functions towards a data passing style.
- Renames placeholder token to '.x'. (Subject to change.)
- Adds "current value" token '._': ".do(5 * chuteName._)".
- Adds examples of chaining with using expressions and literals.
- Memoizes named non-global functions received via ".do(local)".
- Allows method-style calling of memoized non global functions.
- Add conditional block ".do({if:[q,a],else_if:[[q,a]…]else:f}"
- Memoizes functions received via ".if" and conditional block.

# 2024-11-28
- Adds method style global function calling ".fn_name(arg)".
- Adds token to calls Fns with data as argument N.
- Adds chain calling without parentheses e.g. '.log.reverse.log'

# 2024-11-27
- V1

# META
- Project: CHUTE
- Doc: CHANGELOG
- By + Copyright Greg Abbott 2024