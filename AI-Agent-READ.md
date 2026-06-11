# AI-Agent-READ: System Instructions & Project Context

> [!IMPORTANT]
> **READ THIS BEFORE PROCEEDING:** If you are an AI coding assistant or agent tasked with generating content, modifying templates, writing scripts, or troubleshooting this codebase, you must read, understand, and strictly adhere to the directives in this file. Failing to do so will result in compilation crashes or corrupted Word document files.

---

## 1. Project Mission & Architecture

This project automates the creation of high-fidelity, beautifully formatted lesson plan (Modul Ajar) Microsoft Word documents from JSON database records. 

The pipeline works as follows:
1.  **JSON Data Source (`data.json`):** Holds a list of lesson plan meetings under the key `"pertemuan_list"`.
2.  **Word Template (`template.docx`):** Contains static styling, borders, page layouts, and dynamic loop wrappers using `{FOR p IN pertemuan_list}` ... `{END-FOR p}`.
3.  **Compiler (`generate.js`):** Node.js script using `docx-templates` to replace variables, resolve nested array loops, and output the compiled document.
4.  **Math & Jargon Formatter (`apply_formatting.py`):** Post-processor automatically invoked by the compiler. It styles English jargon as italics and parses text equations (e.g., `sqrt(18) = 3sqrt(2)`) into native Word math formatting (Office Math XML / OMML).

---

## 2. Absolute Syntactic Rules (No Exceptions)

When generating templates or code, you must conform to the following formatting requirements:

### Rule 2.1: Loop Structure Syntax
*   **Do NOT use mustache shorthand** (e.g. `{#loop}` ... `{/loop}`). The JavaScript sandbox in `docx-templates` interprets `#` as an ES6 private class field, throwing a `SyntaxError: Private field must be declared in an enclosing class`.
*   **Always use explicit loop commands:** `{FOR item IN array}` and `{END-FOR item}`.
*   **Prefix loop variables with `$`:** Inside a loop block, all attributes of the active element must be prefixed with a dollar sign (e.g. `{$item.name}`).
*   **Specify variable in end tag:** The loop closing tag must include the variable name (e.g. `{END-FOR item}`).

### Rule 2.2: Ternary Checks for Nullable Fields
*   Properties inside JSON objects can be `null` (e.g. `differentiation` or `deep_learning` inside `muatan_inovatif`).
*   Never write flat tags like `{$p.differentiation.type}` without verification. If the object is null, it throws `TypeError: Cannot read properties of null`.
*   **Always use inline ternary evaluations** inside brackets to handle null states:
    `{$p.aktivitas_pembelajaran[1].muatan_inovatif.differentiation ? 'Differentiation (' + $p.aktivitas_pembelajaran[1].muatan_inovatif.differentiation.type + '): ' + $p.aktivitas_pembelajaran[1].muatan_inovatif.differentiation.deskripsi : ''}`

### Rule 2.3: Regex Word Boundary Limitations
*   In Python's `re` module, word boundaries (`\b`) do **not** match after closing parentheses `)` because `)` is a non-word character.
*   Any math regex matching an expression that ends in a parenthesis (such as `\bsqrt\(\d+\)`) **must not have a trailing `\b`**, otherwise the match will fail.

### Rule 2.4: Word Equations (OMML Radical Index Box)
*   Standard OMML radical elements (`<m:rad>`) require the radical properties tag (`<m:radPr>`) containing `<m:degHide m:val="1"/>` along with an empty degree element (`<m:deg/>`) to hide the root index box in MS Word.
*   OMML radical template output:
    ```xml
    <m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>RADICAND</m:e></m:rad>
    ```

---

## 3. Database Schema Blueprint (`data.json`)

If you are asked to generate JSON data payloads, you must follow this exact structure:

```json
{
  "pertemuan_list": [
    {
      "pertemuan_number": "integer (e.g. 1, 2, 3)",
      "model_pembelajaran": "string (e.g. 'Discovery Learning', 'Inquiry Learning')",
      "tujuan_pembelajaran": ["array of strings"],
      "aktivitas_pembelajaran": [
        {
          "waktu_menit": "integer",
          "milestone": "string ('AWAL', 'INTI', 'AKHIR')",
          "tahapan_sintaks": "string",
          "prosedur_guru": "string",
          "prosedur_siswa": "string",
          "pertanyaan_kunci": ["array of strings"],
          "muatan_inovatif": {
            "deep_learning": "string or null",
            "impactful": "string or null",
            "differentiation": {
              "type": "string ('Konten', 'Proses', 'Produk')",
              "deskripsi": "string"
            } or null
          }
        }
      ],
      "asesmen": [
        {
          "jenis": "string ('Diagnostik', 'Afektif', 'Formatif (Proses)', 'Formatif (Refleksi)')",
          "bentuk": "string",
          "lampiran": "string (formatted as 'Title: Description' to allow bold splitting)"
        }
      ]
    }
  ]
}
```

*Note: The `aktivitas_pembelajaran` array must contain exactly 6 items (representing AWAL, INTI 1, INTI 2, INTI 3, AKHIR 1, AKHIR 2). The `asesmen` array must contain exactly 4 items.*

---

## 4. Troubleshooting Playbook

| Error Encountered | Root Cause | Action Item |
| :--- | :--- | :--- |
| `SyntaxError: Private field ...` | You used `#` shorthand loop delimiters in the Word document. | Replace `{#loop}` ... `{/loop}` with `{FOR var IN ...}` ... `{END-FOR var}`. |
| `TypeError: Cannot read properties of null` | A tag accessed a nested property of a null object. | Wrap the tag in an inline JS ternary conditional checking for the object's existence. |
| `Unterminated FOR-loop` | Loop variable name is missing from the end tag, or misspelled. | Ensure closing tag is formatted as `{END-FOR variable_name}`. |
| `EBUSY: resource busy or locked` | Word has `output.docx` open, blocking writes. | The script automatically handles this and writes to `output(N).docx`. Look for the numbered file in the folder. |
| Math characters like `3sqrt(2)` not rendering in math font | The implicit multiplication was not parsed or was skipped. | Check that the text contains no raw unsupported symbols. The script splits at `sqrt(` or `(` boundaries. |
| Dotted box `⌷` in radical | The `<m:degHide>` property is missing. | Verify that `apply_formatting.py` injected the correct `<m:radPr>` block with `<m:degHide m:val="1"/>`. |
