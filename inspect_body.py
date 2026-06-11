import docx

doc = docx.Document('Test.docx')
body = doc.element.body

for idx, child in enumerate(body):
    tag = child.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(child, doc)
        text = p.text.strip()
        if text:
            print(f"Index {idx}: [Paragraph] {text[:100]}")
    elif tag == 'tbl':
        # Find which table index this corresponds to
        for t_idx, t in enumerate(doc.tables):
            if t._element == child:
                # Print table header
                print(f"Index {idx}: [Table {t_idx}] Rows: {len(t.rows)}, First Cell: {t.rows[0].cells[0].text.strip()[:60].replace(chr(10), ' ')}")
                break
