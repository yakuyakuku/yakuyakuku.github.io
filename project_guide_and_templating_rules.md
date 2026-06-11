# Project Guide: Lesson Plan Template Compiler

This guide explains how this compiler project works, the folder structure, the code components, and the exact rules for writing templates, managing formatting fallbacks, and rendering native mathematical equations in Microsoft Word. It is designed to serve as an instruction sheet for AI developers or system prompts.

---

## 1. System Architecture & Workflow

The compiler converts a list of lesson plan meetings (Modul Ajar) from a JSON file into **one single Microsoft Word (`.docx`) file**, automatically converting text math notations into native Word equations and italicizing English jargon.

### Compilation Pipeline

```mermaid
graph TD
    A[data.json] -->|JSON data payload| D[generate.js Compiler]
    B[template.docx] -->|Looping page template| D
    D -->|1. docx-templates render| E[Intermediate docx]
    E -->|2. Smart Lock check| F{Is output.docx locked?}
    F -->|Yes| G[Auto-save as output(N).docx]
    F -->|No| H[Save as output.docx]
    G -->|3. Run post-processor| I[apply_formatting.py]
    H -->|3. Run post-processor| I
    I -->|4. Regex scan & split runs| J[Format English Jargon as Italics]
    I -->|5. OMML XML Parser| K[Inject Native MS Word Math Equations]
    K -->|6. Save finalized file| L[Final Styled docx File]
```

1.  **docx-templates rendering:** `generate.js` unzips `template.docx`, binds `data.json` context, loops through the meeting list, and duplicates pages for each meeting.
2.  **Smart lock handling:** If the target output document is open in MS Word, the script automatically catches the write-lock error (`EBUSY`/`EPERM`) and saves to a fallback copy (`output(1).docx`, `output(2).docx`, etc.).
3.  **Typography & Math post-processing:** The script calls `python apply_formatting.py` on the output file.
4.  **Math Translation:** The post-processor parses inline equations using a custom tokenizing engine and translates them to **native MS Word Office Math XML (OMML)**.
5.  **Italicization:** The post-processor italicizes designated English formal terms.

---

## 2. Project File Structure

*   `template.docx`: The repeating page loop MS Word template file containing layout and brackets.
*   `data.json`: The structured JSON database entry containing a list of meetings under `pertemuan_list`.
*   `generate.js`: The Node.js compiler that unzips `template.docx`, binds `data.json`, runs the rendering engine, and triggers the post-processor.
*   `apply_formatting.py`: A Python formatter script that parses the compiled document, translating plain-text math expressions into native Microsoft Word Office Math equations (OMML) and styling English formal terms as italics.
*   `convert_to_dynamic_loop.py`: A Python helper script using `python-docx` to truncate static meetings 2-4 and inject the loop wrappers.
*   `output.docx`: The final compiled Word document (or `output(N).docx` if locked).

---

## 3. Templating Syntax Rules (`docx-templates` with `{`/`}` delimiters)

This project configures the delimiters as single curly braces `cmdDelimiter: ['{', '}']`. Below is the exact syntax required:

### A. Outer Repeating Page Loop
To repeat the entire meeting block (header, tables, spacing) for each entry:
1.  Add `{FOR p IN pertemuan_list}` as the very first paragraph of the document.
2.  Add `{END-FOR p}` as the very last paragraph of the document.
3.  *Inside this outer loop, all variables representing the meeting properties must be prefixed with `$p.`.*

### B. Meeting Variables
Replaced inline inside the loop.
*   **Format:** `{$p.variable_name}` or `{$p.nested.property}`
*   **Examples:**
    *   `{$p.pertemuan_number}` $\rightarrow$ `1`, `2`, `3`
    *   `{$p.model_pembelajaran}` $\rightarrow$ `Discovery Learning`

### C. List Element by Index (Array Access)
Allows you to pull items out of a list at specific positions without flat row loops.
*   **Format:** `{$p.array_name[index].property_name}`
*   **Examples:**
    *   `{$p.aktivitas_pembelajaran[0].waktu_menit}` $\rightarrow$ `15`
    *   `{$p.aktivitas_pembelajaran[1].tahapan_sintaks}` $\rightarrow$ `Pengumpulan Data`

### D. Loops for Simple String Arrays
To output a list of text strings (like learning objectives).
*   **Format:**
    ```text
    {FOR tp IN $p.tujuan_pembelajaran}{$tp}{END-FOR tp}
    ```
*   **Critical Rules:**
    1.  Inside the loop, the variable **MUST** be prefixed with a dollar sign (`$tp`).
    2.  The termination tag **MUST** include the variable name (`END-FOR tp`).

### E. Nested Loops for String Arrays (e.g., Key Questions)
*   **Format:**
    ```text
    {FOR pk IN $p.aktivitas_pembelajaran[0].pertanyaan_kunci}{$pk}\n{END-FOR pk}
    ```
*   *Note: Standard JS evaluation is supported, so you reference the loop index variable `$p` and access nested arrays.*

---

## 4. Mathematical Equation Rendering (OMML Parser)

The post-processor converts plain text equations (like `sqrt(18) = 3sqrt(2)`) into native MS Word Office Math elements.

### A. OMML XML Schema Translations

*   **Fractions (`A/B`):** Converted to `<m:f>` elements:
    ```xml
    <m:f>
      <m:num><m:r><m:t>A</m:t></m:r></m:num>
      <m:den><m:r><m:t>B</m:t></m:r></m:den>
    </m:f>
    ```
*   **Superscripts / Powers (`A^B`):** Converted to `<m:sSup>` elements:
    ```xml
    <m:sSup>
      <m:e><m:r><m:t>A</m:t></m:r></m:e>
      <m:sup><m:r><m:t>B</m:t></m:r></m:sup>
    </m:sSup>
    ```
*   **Radicals / Square Roots (`sqrt(A)`):** Converted to `<m:rad>` elements. 
    > [!IMPORTANT]
    > To hide the empty degree index box (`⌷√A`) in Microsoft Word, you must include a `<m:radPr>` properties tag containing `<m:degHide m:val="1"/>` and keep the `<m:deg/>` tag empty:
    ```xml
    <m:rad>
      <m:radPr><m:degHide m:val="1"/></m:radPr>
      <m:deg/>
      <m:e><m:r><m:t>A</m:t></m:r></m:e>
    </m:rad>
    ```
*   **Implicit Multiplication Support:**
    Terms like `3sqrt(2)` and `2(x+3)` are parsed recursively, splitting coefficients from their functions or parentheses (translating them to `3 * sqrt(2)` and `2 * (x+3)` structures respectively).

### B. Regex Match Rules for Math Expressions
To avoid swallowing normal text paragraphs and sentences during parsing, the regex patterns in the python script must satisfy the following constraints:
1.  **No Greedy Whitespace:** Do not use greedy wildcard checks like `[\s\w]+` inside equation-matching regexes. Only allow optional spaces `\s*` around mathematical symbols (such as `=`).
2.  **No Boundary Boundaries (`\b`) on Parentheses:** Word boundary checks (`\b`) do not match after closing parentheses `)`. Therefore, any regex pattern ending in a parenthesis (such as `\d+/\(\d+-sqrt\(\d+\)\)`) **must not** have a trailing `\b`.
