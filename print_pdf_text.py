import pypdf

reader = pypdf.PdfReader('Test.pdf')
with open('pdf_text.txt', 'w', encoding='utf-8') as f:
    for idx, page in enumerate(reader.pages):
        f.write(f"=== Page {idx + 1} ===\n")
        f.write(page.extract_text() or "")
        f.write("\n\n")

print("Successfully written PDF text to pdf_text.txt!")
