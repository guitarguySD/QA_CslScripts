# CVS / CSL Script Language Support — User Manual

**Extension:** CVS / CSL Script Language Support
**File type:** `.cvs` (Call Script Language / Call Vector Script)
**Publisher:** Sonant

---

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [First Time Setup](#3-first-time-setup)
4. [Feature Overview](#4-feature-overview)
5. [IntelliSense and Completions](#5-intellisense-and-completions)
6. [Hover Documentation](#6-hover-documentation)
7. [Navigation](#7-navigation)
8. [Validation and Quick Fixes](#8-validation-and-quick-fixes)
9. [Block Help Panel](#9-block-help-panel)
10. [Code Snippets and Patterns](#10-code-snippets-and-patterns)
11. [Rename Support](#11-rename-support)
12. [Semantic Highlighting](#12-semantic-highlighting)
13. [Document Formatting](#13-document-formatting)
14. [Signature Help](#14-signature-help)
15. [Folding and Code Lens](#15-folding-and-code-lens)
16. [Workspace Symbol Search](#16-workspace-symbol-search)
17. [AI Assistants](#17-ai-assistants)
    - [@csl — Reference Assistant](#csl--reference-assistant)
    - [@mjudy — Murray Judy, Senior Reviewer](#mjudy--murray-judy-senior-reviewer)
18. [Custom Knowledge Patterns](#18-custom-knowledge-patterns)
19. [Samples and Templates](#19-samples-and-templates)
20. [CSL MCP Server (AI Integration)](#20-csl-mcp-server-ai-integration)
21. [Getting Help](#21-getting-help)

---

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Visual Studio Code | 1.85 or later | |
| **.NET 10 Runtime** | **10.0 or later** | **Required.** The language server and MCP server are framework-dependent DLLs that need the .NET runtime |
| VS Code Chat provider | Any | Optional. Required for `@csl` and `@mjudy` AI assistants (GitHub Copilot, Claude for VS Code, or any LM provider) |

### Installing .NET 10

Download and install the **.NET 10 Runtime** (not the SDK, unless you're a developer) from:
**https://dotnet.microsoft.com/download/dotnet/10.0**

After installation, verify by opening a terminal and running:
```
dotnet --list-runtimes
```
You should see `Microsoft.NETCore.App 10.x.x` in the output.

> **What happens if .NET is not installed?** The extension will still provide syntax highlighting, code snippets, and the Block Help panel. However, all language server features (completions, validation, hover, navigation, formatting, rename, etc.) and the MCP server will be unavailable. An error notification with a download link will appear on activation.

---

## 2. Installation

The extension is distributed as a `.vsix` file. It is not on the VS Code Marketplace.

**Steps:**

1. Open VS Code
2. Open the Extensions panel (`Ctrl+Shift+X`)
3. Click the **`···`** menu (top-right of the Extensions panel)
4. Select **Install from VSIX...**
5. Browse to the `.vsix` file and click **Install**
6. Reload VS Code when prompted

Alternatively, from the command line:

```
code --install-extension cvs-language-support-1.0.0.vsix
```

> **Note:** Close VS Code before running the command-line install if the extension is already installed, otherwise the file will be locked.

---

## 3. First Time Setup

No configuration is required. Open any `.cvs` file and the extension activates automatically.

The language server starts in the background. A `CVS Language Server` indicator appears in the status bar when it is ready.

**Optional — custom server path:**
If you need to point the extension at a specific language server build (for development or testing):

```json
// .vscode/settings.json
{
  "cvsLanguageServer.serverPath": "C:/path/to/Sonant.Domain.Script.Compiler.LanguageServer.exe"
}
```

Leave this blank to use the bundled server.

**Restart the server** at any time: `Ctrl+Shift+P` → `CVS: Restart Language Server` (or `Ctrl+Shift+F5`).

---

## 4. Feature Overview

| Feature | How to access |
|---|---|
| Syntax highlighting | Automatic on `.cvs` files |
| Semantic highlighting | Automatic — rich colours for block headers, types, variables, comments, nav properties |
| IntelliSense completions | `Ctrl+Space` or type to trigger |
| Context-aware pattern snippets | `Ctrl+Space` then type `pattern` to filter |
| Hover documentation | Hover over block type or property name |
| Signature help | Type `=` after a property name — shows type, valid values, required status |
| Go to Definition | `F12` on a block name |
| Peek Definition | `Alt+F12` on a block name |
| Find All References | `Shift+F12` on a block name |
| Rename block | `F2` on a block name — renames header + all references |
| Document Outline | View → Open View → Outline |
| Workspace Symbol Search | `Ctrl+T` — search blocks across all open `.cvs` files |
| Code Lens | Reference counts shown above each `[BlockName]` header |
| Folding | Click fold arrows next to `[Block]` headers and `"""` triple-quote sections |
| Document Formatting | `Shift+Alt+F` — normalise spacing, flush headers, clean `key=value` |
| Real-time validation | Inline squiggles + Problems panel (`Ctrl+Shift+M`) |
| Quick fixes | `Ctrl+.` on a squiggle — create missing block, add missing property, remove unused block |
| Block Help panel | `Ctrl+F1` or toolbar book icon |
| Samples / templates | `Ctrl+Shift+P` → `CVS: Open Sample Script` |
| New from template | `Ctrl+Shift+P` → `CVS: New Script from Template` |
| Documentation | `Ctrl+Shift+P` → `CVS: Open Documentation` |
| AI assistant — reference | `@csl` in the Chat panel |
| AI assistant — senior review | `@mjudy` in the Chat panel |

---

## 5. IntelliSense and Completions

The extension provides context-aware completions throughout a `.cvs` file.

**`type=` completions**
After `type=`, all valid block types are listed with a brief description of each.

**Property completions**
Inside a block, press `Ctrl+Space` or start typing to see all applicable properties for that block type — marked as required or optional, with their type (BlockName, Integer, Enum, etc.).

**Enum value completions**
For properties with a fixed set of values (e.g. `Direction=`, `Command=`), valid values are listed automatically.

**Block name completions**
On navigation properties (`Next=`, `OnKey1=`, `OnError=`, etc.), all block names defined in the current script are offered as completions.

**Variable completions**
On `Var=`, `ArrayVar=`, `CountVar=`, etc., all declared variables from `DefineVars` blocks are offered.

**Context-aware pattern snippets**
Press `Ctrl+Space` anywhere in a block and type `pattern` to see multi-block IVR patterns tailored to the current block type. For example, inside a Menu block you'll see "Digit Branch Pattern" and "Retry Loop Pattern". In an empty file, a complete script skeleton is offered.

---

## 6. Hover Documentation

Hover the mouse over any of the following to see documentation:

| What you hover over | What you see |
|---|---|
| A block type value (`type=Menu`) | Block summary, category, required params |
| A property name (`TimeoutSec`) | Type, required/optional, default value, description |
| An enum value (`Command=RouteCall`) | Description of that specific value |
| A block name in navigation (`Next=MainMenu`) | A preview of the target block (first few lines) |

---

## 7. Navigation

**Go to Definition — `F12`**
Place the cursor on any block name used in a navigation property and press `F12` to jump directly to that block's `[Header]` line. Works across the whole file.

**Peek Definition — `Alt+F12`**
Same as Go to Definition, but opens an inline preview without leaving the current location.

**Find All References — `Shift+F12`**
On a `[BlockName]` header or a navigation target, lists every place that block is navigated to.

**Document Outline**
The Outline panel (`View → Open View → Outline`) lists every block in the script in file order. Click any entry to jump to it. Blocks are grouped by type when the outline is sorted by type.

**Breadcrumbs**
The breadcrumb bar at the top of the editor shows the current block name as you scroll.

---

## 8. Validation and Quick Fixes

The language server validates your script in real time with 500ms debouncing (no lag while typing). Errors and warnings appear as coloured squiggles in the editor. The **Problems panel** (`Ctrl+Shift+M`) lists all issues.

| Code | Severity | Meaning |
|---|---|---|
| CSL001 | Error | Navigation target does not exist in this script |
| CSL002 | Hint | Block is unreachable (nothing navigates to it) |
| CSL003 | Error | Missing required property for this block type |
| CSL004 | Warning | Missing conditionally-required property |
| CSL005 | Warning | Circular reference detected |

**Quick Fixes (`Ctrl+.`)**
Place the cursor on a squiggle and press `Ctrl+.` to see available fixes:

| Diagnostic | Quick fix offered |
|---|---|
| CSL001 — undefined block reference | Create the missing `[BlockName]` block at the end of the script |
| CSL002 — unreferenced block | Remove the unused block section |
| CSL003 — missing required property | Add the property with a default value |
| CSL004 — missing conditional property | Add the property with a default value |

**C# script validation** (for `ElementScript`, `ResponseScript`, etc.)
Inline C# inside triple-quoted blocks is validated for syntax errors. Issues are reported with line numbers relative to the script block.

---

## 9. Block Help Panel

The Block Help panel shows structured documentation for any CVS block type — parameters, types, defaults, and examples.

**Open it:**
- Press `Ctrl+F1` with a `.cvs` file open
- Click the book icon in the editor toolbar
- `Ctrl+Shift+P` → `CVS: Show Block Help`

The panel auto-updates as you move the cursor between blocks. Click any parameter row to expand its full description. The example code at the bottom can be copied to clipboard.

---

## 10. Code Snippets and Patterns

### Single-block snippets

Trigger by typing the block type name:

| Type | Snippet prefix | What it inserts |
|---|---|---|
| SetGlobals | `setglobals` | Full globals block with error handlers |
| SetDefaults | `setdefaults` | Defaults block with DTMF settings |
| Menu block | `menu` | Menu skeleton with key handlers |
| ACD routing | `acd` | ACD block with Command and navigation |
| RestApi | `restapi` | REST call with auth and response handling |
| ForEach | `foreach` | ForEach block with ElementScript placeholder |
| DefineVars | `definevars` | Vars block with comment guidance |
| Play | `play` | Play block with Msg and Next |
| GetDigits | `getdigits` | Digit collection with Var and terminator |
| Branch | `branch` | Conditional branch with value routing |
| ChangeVariable | `changevariable` | Set variable value |
| Terminate | `terminate` | Termination block |

After inserting a snippet, use `Tab` to move between the placeholder fields.

### Multi-block pattern snippets

Press `Ctrl+Space` and type `pattern` to see context-aware multi-block patterns:

| Pattern | When offered | What it inserts |
|---|---|---|
| Error Handler Pattern | Always | 4 standard error/disconnect handler blocks |
| Variable Init Pattern | Always | DefineVars block with common IVR variables |
| Digit Branch Pattern | Inside Menu / GetDigits | Branch block for digit routing |
| Retry Loop Pattern | Inside Menu / GetDigits | Retry counter + loop-back to menu |
| Callback Offer Pattern | Inside ACD | Menu offering callback vs. stay in queue |
| Queue Comfort Pattern | Inside ACD | Hold music rotation loop |
| API Response Handler | Inside RestApi | Branch on HTTP status codes |
| Transfer Pattern | Inside Play | ACD transfer to agent |
| ForEach Loop Pattern | Inside Branch / ChangeVariable | Array iteration block |
| Script Init Sequence | Inside SetGlobals | SetDefaults + DefineVars + Answer |
| Complete Script Skeleton | Empty file | Full IVR script template (10 blocks) |

---

## 11. Rename Support

**Rename a block — `F2`**

Place the cursor on any `[BlockName]` header or on a block name in a navigation property (`Next=BlockName`) and press `F2`. Type the new name — the block header and **all references** across the script update in one operation.

The rename validates that the cursor is on a renamable symbol before showing the rename input box.

---

## 12. Semantic Highlighting

The extension provides rich semantic highlighting beyond the TextMate grammar. Eight token types are highlighted with distinct colours:

| Element | Colour intent |
|---|---|
| `[BlockName]` headers | Namespace (bold, definition-style) |
| `type=` values (`Menu`, `Play`) | Type |
| Property names (`PlayMsg=`, `Var=`) | Property |
| Navigation property names (`Next=`, `OnError=`) | Keyword |
| Navigation property values (block references) | Enum member |
| `@SystemVariable` and `{UserVariable}` | Variable |
| `! comments` | Comment |
| `"""triple-quote blocks"""` | String |

Exact colours depend on your VS Code colour theme.

---

## 13. Document Formatting

**Format the document — `Shift+Alt+F`**

Normalises the entire script:
- Exactly one blank line between blocks (no extra or missing)
- Block headers flush left (no indentation)
- Property lines: `key=value` format (no spaces around `=`, trailing whitespace removed)
- Triple-quote block contents are left untouched
- Trailing blank lines cleaned

---

## 14. Signature Help

When you type `=` after a property name (e.g. `PlayMsg=`), a tooltip appears showing:

- Property type (MsgFile, Boolean, Integer, BlockName, etc.)
- Required/optional status
- Valid values (if the property has a fixed set)
- Default value
- Description

If the property has predefined values, each value is shown as an alternative signature you can select.

---

## 15. Folding and Code Lens

### Folding

Click the fold arrow in the gutter next to:
- **`[BlockName]` headers** — folds the entire block (up to the next header)
- **`"""`** triple-quote blocks — folds the embedded code section

### Code Lens

Above each `[BlockName]` header, a code lens shows **"N references"** — the number of navigation properties that target this block. Click the code lens to see all references (same as `Shift+F12`).

---

## 16. Workspace Symbol Search

**Search across files — `Ctrl+T`**

Opens the workspace symbol search. Type a block name to find blocks across **all open `.cvs` files**. Select a result to jump directly to that block in the correct file.

Blocks are categorised by type (Function for most blocks, Variable for DefineVars, Namespace for SetGlobals/SetDefaults, Module for Menu).

---

## 17. AI Assistants

Both assistants work with **any VS Code language model provider** — GitHub Copilot, Claude for VS Code, or other LM extensions. Open the Chat panel with `Ctrl+Alt+I`.

---

### @csl — Reference Assistant

`@csl` is a focused, knowledgeable reference assistant. It knows every block type with full parameter documentation, the CSL script lifecycle, ACD routing lifecycle, system variables, and best practices.

**Invoke it:**

```
@csl how do I collect a 10-digit account number?
@csl what properties does RestApi support?
@csl explain the ACD routing lifecycle and @AcdRouteCode values
```

**Slash commands:**

| Command | Purpose | Example |
|---|---|---|
| `/create` | Generate complete, ready-to-use CVS blocks | `@csl /create a GetDigits block with 3 retries` |
| `/explain` | Explain a block, property, or concept | `@csl /explain what is the difference between OnTimeout and OnNoInput?` |
| `/validate` | Review the open script for structural issues | `@csl /validate` |

**Context injected automatically:**
- Full block reference (every block type, all params with types/valid values/defaults/descriptions)
- Matched patterns from the pattern library (based on keywords in your question)
- Open script context: block names, types, declared variables

---

### @mjudy — Murray Judy, Senior Reviewer

Murray Judy designed CVS. He has been building telephony IVR systems for a long time, and he is genuinely invested in the language being used well. He is warm and constructive, with a dry wit and a low tolerance for missing `OnError` handlers.

Murray can write code directly into your script (he'll offer a button to append generated blocks). He notices good work and says so specifically.

**Invoke it:**

```
@mjudy can you review this script?
@mjudy build me an outbound dialler block with callback handling
```

**Slash commands:**

| Command | Purpose | Example |
|---|---|---|
| `/create` | Murray builds production-ready CVS blocks and offers to append them to your script | `@mjudy /create a full ACD routing section with fallback` |
| `/review` | Murray reviews the open script like a senior developer — specific, honest, constructive | `@mjudy /review` |

**What Murray watches for:**
- Missing `OnError` on CallControl, Call, and ACD blocks
- Hardcoded phone numbers or credentials (should use `VariableManager`)
- Navigation that ends in `Terminate` without a farewell message
- Missing `SetGlobals` at the top of the script
- ACD routing without `OnCallReturn` handler (RouteCode 9 — agent AWOL)
- Retry loops with no maximum (infinite caller loops)
- Variables used but not declared in `DefineVars`
- Copy-pasted blocks with stale navigation targets

---

## 18. Custom Knowledge Patterns

You can teach both `@csl` and `@mjudy` about your team's standard patterns. Patterns are Markdown files stored in `.vscode/cvs-patterns/` in your workspace.

**Create a new pattern:**

`Ctrl+Shift+P` → `CVS: New Custom Knowledge Pattern`

Enter a name — a scaffolded `.md` file opens in the editor. Fill in:
- `name` and `tags` (front matter)
- A description of when to use the pattern
- The CVS block template in a ` ```cvs ``` ` code block

**How it works:**
The assistant scans your question for keywords matching pattern names and tags. If a match is found, the full pattern template is injected into the assistant's context automatically — no need to manually reference it.

**Example:**
A pattern tagged `[payment, hps, credit-card]` is automatically pulled in whenever you ask about payment, HPS, or credit cards.

**12 bundled patterns included:**
`acd-routing-full`, `acd-routing-with-callback`, `after-hours-holiday-check`, `call-transfer-types`, `digit-collection-loop`, `hps-payment-bridge`, `hps-payment-session`, `letter-entry-dtmf`, `multi-language-greeting`, `rest-api-foreach-iteration`, `script-setup-standard`, `variable-manager-config`

For more detail: `CVS: Open Documentation` → **Custom Patterns**.

---

## 19. Samples and Templates

**Open a sample script** (read-only reference):
`Ctrl+Shift+P` → `CVS: Open Sample Script`

**New script from template** (editable copy):
`Ctrl+Shift+P` → `CVS: New Script from Template`

Samples include complete working scripts covering common IVR patterns: basic IVR, menu navigation, call control, data processing, and production-scale inbound routing.

---

## 20. CSL MCP Server (AI Integration)

The **CSL MCP Server** makes CSL knowledge available to **any AI assistant** that supports the Model Context Protocol — Claude Code, Claude Desktop, Cursor, Cline, Windsurf, and others.

### Bundled with the extension

The MCP server binary is **included in the `.vsix` package** alongside the language server. When you install the extension and open a workspace containing `.cvs` files, the extension automatically creates `.vscode/mcp.json` pointing to the bundled binary. **No manual setup is required for VS Code.**

For other IDEs (Claude Code, Claude Desktop, Cursor), the bundled binary can be referenced directly — see [Configuration for other IDEs](#configuration-for-other-ides) below.

> **To disable auto-configuration:** Set `cvsLanguageServer.disableMcpAutoConfig` to `true` in VS Code settings.

### What it provides

| Type | Name | Description |
|---|---|---|
| Tool | `csl_block_help` | Get documentation for any CSL block type (or all types) — properties, types, valid values, defaults |
| Tool | `csl_validate` | Compile a CSL script and return errors and warnings |
| Tool | `csl_patterns` | Search bundled IVR patterns by keyword (e.g. "acd callback", "payment") |
| Resource | `csl://reference` | Complete CSL language reference — script lifecycle, all 33 block types, system variables, best practices |

### Build from source (optional)

Only needed if you're developing the MCP server itself. The `.vsix` build script (`build.ps1`) handles this automatically.

```bash
cd Domain/Script/Compiler.McpServer
dotnet build --tl:off
```

### VS Code (automatic)

When the extension activates, it writes `.vscode/mcp.json` with the MCP server path. VS Code 1.99+ reads this automatically. You don't need to do anything (requires .NET 10).

The generated config looks like:
```json
{
  "servers": {
    "csl": {
      "command": "dotnet",
      "args": ["C:/Users/<you>/.vscode/extensions/cvs-language-support-1.0.0/server/bin/Sonant.Domain.Script.Compiler.McpServer.dll"],
      "type": "stdio"
    }
  }
}
```

### Configuration for other IDEs

For IDEs outside VS Code, use `dotnet` to launch the bundled DLL. The DLL path inside the installed extension is:

```
~/.vscode/extensions/cvs-language-support-1.0.0/server/bin/Sonant.Domain.Script.Compiler.McpServer.dll
```

#### Claude Code

Add `.mcp.json` to your project root:

```json
{
  "mcpServers": {
    "csl": {
      "command": "dotnet",
      "args": ["C:/Users/<you>/.vscode/extensions/cvs-language-support-1.0.0/server/bin/Sonant.Domain.Script.Compiler.McpServer.dll"]
    }
  }
}
```

#### Claude Desktop

Add to `claude_desktop_config.json` (`%APPDATA%/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "csl": {
      "command": "dotnet",
      "args": ["C:/Users/<you>/.vscode/extensions/cvs-language-support-1.0.0/server/bin/Sonant.Domain.Script.Compiler.McpServer.dll"]
    }
  }
}
```

#### Cursor

In Cursor settings → MCP Servers, add:
- **Name:** `csl`
- **Command:** `dotnet`
- **Args:** Path to the bundled `Sonant.Domain.Script.Compiler.McpServer.dll` (see above)

### Usage examples

Once configured, your AI assistant can:

- **"What properties does the ACD block have?"** — AI calls `csl_block_help`
- **"Validate this script..."** — AI calls `csl_validate` and reports errors
- **"Show me a callback pattern"** — AI calls `csl_patterns`
- **"What is CSL?"** — AI reads the `csl://reference` resource

The MCP server uses the same `Script.Compiler` library as the language server, so block documentation, validation rules, and pattern knowledge are always consistent.

---

## 21. Getting Help

**In-editor documentation:**
`Ctrl+Shift+P` → `CVS: Open Documentation` — opens the docs folder with:
- `getting-started.md` — quick start
- `language-reference.md` — full block syntax and navigation rules
- `validation-errors.md` — CSL001–CSL005 explained
- `chat-assistant.md` — AI assistant reference
- `custom-patterns.md` — pattern authoring guide

**Block Help panel:**
`Ctrl+F1` — live documentation for whichever block type the cursor is in.

**Ask the AI:**

```
@csl /explain SetGlobals block
@mjudy what is the correct structure for a script that uses ACD routing?
```

**Restart the language server** (if hover/completions stop responding):
`Ctrl+Shift+F5` or `Ctrl+Shift+P` → `CVS: Restart Language Server`

**Auto-restart:**
If the language server crashes, it automatically restarts up to 3 times. A notification appears if the server fails to recover.
