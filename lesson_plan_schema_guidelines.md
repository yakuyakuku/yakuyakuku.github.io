# Lesson Plan (Modul Ajar) Schema & Layout Guidelines

This document provides a detailed specification of the **Pertemuan (Meeting) Pattern** structure, database/JSON schema, and content generation guidelines. It is designed to be used for fine-tuning models or crafting system prompts so that an AI can generate or validate lesson plans that strictly adhere to this format.

---

## 1. JSON Schema Specification

For programmatic representation (e.g., in databases, API payloads, or JSON-mode LLM generations), a single `Pertemuan` should follow this JSON schema structure:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PertemuanSchema",
  "type": "object",
  "properties": {
    "pertemuan_number": {
      "type": "integer",
      "description": "The sequential number of the meeting (e.g., 1, 2, 3, 4)."
    },
    "model_pembelajaran": {
      "type": "string",
      "description": "The pedagogical model used (e.g., 'Discovery Learning', 'Problem Based Learning', 'Project Based Learning')."
    },
    "tujuan_pembelajaran": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of learning objectives (TP) covered in this specific meeting."
    },
    "aktivitas_pembelajaran": {
      "type": "array",
      "description": "Chronological list of learning activities comprising the meeting.",
      "items": {
        "type": "object",
        "required": [
          "waktu_menit",
          "milestone",
          "tahapan_sintaks",
          "prosedur_guru",
          "prosedur_siswa",
          "pertanyaan_kunci"
        ],
        "properties": {
          "waktu_menit": {
            "type": "integer",
            "description": "Duration of the activity phase in minutes."
          },
          "milestone": {
            "type": "string",
            "enum": ["AWAL", "INTI", "AKHIR / PENUTUP"],
            "description": "The general milestone of the lesson."
          },
          "tahapan_sintaks": {
            "type": "string",
            "description": "Specific syntax step name mapping to the model_pembelajaran."
          },
          "prosedur_guru": {
            "type": "string",
            "description": "Action-oriented description of the teacher's activities."
          },
          "prosedur_siswa": {
            "type": "string",
            "description": "Action-oriented description of the students' activities."
          },
          "pertanyaan_kunci": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Essential/key questions asked during this phase."
          },
          "muatan_inovatif": {
            "type": "object",
            "properties": {
              "deep_learning": {
                "type": "string",
                "nullable": true,
                "description": "How the activity deepens understanding (e.g., connecting prior knowledge)."
              },
              "impactful": {
                "type": "string",
                "nullable": true,
                "description": "Value-building or character traits fostered (e.g., Integrity, Mindfulness)."
              },
              "differentiation": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": ["Konten", "Proses", "Produk"],
                    "description": "The dimension of differentiation used."
                  },
                  "deskripsi": {
                    "type": "string",
                    "description": "Detailed explanation of how the instruction is differentiated."
                  }
                },
                "nullable": true
              }
            },
            "nullable": true
          }
        }
      }
    },
    "asesmen": {
      "type": "array",
      "description": "The list of assessments configured for this meeting.",
      "items": {
        "type": "object",
        "required": ["jenis", "bentuk", "lampiran"],
        "properties": {
          "jenis": {
            "type": "string",
            "enum": ["Diagnostik", "Afektif", "Formatif (Proses)", "Formatif (Refleksi)"],
            "description": "The type of assessment."
          },
          "bentuk": {
            "type": "string",
            "description": "How the assessment is structured/delivered (e.g., Exit ticket, Pre-test 5 PG)."
          },
          "lampiran": {
            "type": "string",
            "description": "Detailed description of the tool, rubric, index, or questions."
          }
        }
      }
    }
  },
  "required": [
    "pertemuan_number",
    "model_pembelajaran",
    "tujuan_pembelajaran",
    "aktivitas_pembelajaran",
    "asesmen"
  ]
}
```

---

## 2. Layout & Column Specifications

When rendering or writing a lesson plan, the layout is strictly divided into two visual tables:

### Table A: Aktivitas Pembelajaran (6-column Layout)
This table outlines the narrative of the learning flow.

1.  **Waktu (Duration)**
    *   *Format:* Numeric value followed by a single quote representing minutes (e.g., `15'`, `20'`).
    *   *Rule:* Total duration of all activities in the table must equal the planned duration of the lesson block (commonly 80' or 90').
2.  **Tahapan Sintaks (Syntax Phase)**
    *   *Format:* Organized under three bold capital headers representing the session flow:
        *   **AWAL (Bermakna)**: Intro/Hooks.
        *   **INTI (Berkesadaran, Bermakna, Menggembirakan)**: The core learning process.
        *   **AKHIR (Refleksi dan Penutup)** or **PENUTUP (Berkesadaran)**: Closures.
    *   *Pedagogical Rule:* The sub-activities under the **INTI** header must dynamically change depending on the chosen `model_pembelajaran`:
        *   *Discovery Learning:* Stimulasi & Pernyataan Masalah $\rightarrow$ Pengumpulan Data $\rightarrow$ Pengolahan Data $\rightarrow$ Pembuktian $\rightarrow$ Generalisasi.
        *   *Problem-Based Learning:* Orientasi Masalah $\rightarrow$ Mengorganisasi Siswa $\rightarrow$ Penyelidikan Mandiri/Kelompok $\rightarrow$ Mengembangkan & Menyajikan Hasil Karya $\rightarrow$ Menganalisis & Evaluasi.
        *   *Project-Based Learning:* Pertanyaan Mendasar $\rightarrow$ Mendesain Perencanaan Produk $\rightarrow$ Menyusun Jadwal Pembuatan $\rightarrow$ Memonitor Keaktifan & Perkembangan Proyek $\rightarrow$ Menguji Hasil $\rightarrow$ Evaluasi Pengalaman.
3.  **Prosedur Guru (Teacher's Procedure)**
    *   *Format:* Narrative written in the third person using Indonesian action verbs.
    *   *Requirement:* Must contain concrete teaching actions (e.g., *"Guru mendemonstrasikan secara komparatif..."*, *"Guru memantau pengerjaan siswa dan memberikan scaffolding..."*).
4.  **Prosedur Siswa (Student's Procedure)**
    *   *Format:* Narrative reflecting active learning responses.
    *   *Requirement:* Must align directly with the parallel teacher's action (e.g., *"Siswa mencatat struktur..."*, *"Siswa secara berkelompok mendiskusikan..."*).
5.  **Pertanyaan Kunci (Key Questions)**
    *   *Format:* Bulleted list of open-ended, conceptual questions.
    *   *Rule:* Avoid low-level recall questions. Focus on promoting critical/computational thinking (e.g., *"Mengapa kita membutuhkan metode melengkapkan kuadrat jika ada metode faktorisasi?"*).
6.  **Muatan Inovatif (Innovative Integrations)**
    *   *Components:*
        *   **Deep Learning:** Explains the cognitive connection made (e.g., *"Mengaitkan pengetahuan awal dengan konsep baru..."*).
        *   **IMPACTFUL:** Describes character/work ethic traits observed (e.g., Integrity: doing work without auto-solvers, Mindfulness: active listening).
        *   **Differentiation:** Categorized by **Konten** (tiered worksheets), **Proses** (heterogeneous groups/diverse media), or **Produk** (flexible reporting choices such as charts, writing, or speech).

### Table B: Rencana Asesmen (3-column Layout)
This table follows the activity flow to plan evaluations.

1.  **Jenis Asesmen (Type)**
    *   *Choices:* `Diagnostik`, `Afektif`, `Formatif (Proses)`, `Formatif (Refleksi)`.
2.  **Bentuk Asesmen (Form)**
    *   *Requirement:* Specific, actionable assessment formats (e.g., *Pre-test 5 soal pilihan ganda*, *Observasi keterlibatan*, *Kinerja kelompok/individu*, *Jurnal Refleksi*).
3.  **Lampiran Asesmen (Appendix/Tools)**
    *   *Requirement:* Clear details on *how* it is graded (e.g., *Lembar Soal Diagnostik*, *Lembar Observasi Guru (skala rubrik 1-4)*, *Lembar Penilaian Kinerja (LKBA) untuk algoritma flowchart*, *Jurnal Refleksi Siswa*).

---

## 3. Fill-up Guide for AI Prompting (Zero-Shot / Few-Shot Instructions)

When prompting an AI to generate a lesson plan based on this schema, use the following directives:

> ### Prompter Instructions for Generating Lesson Plans (Modul Ajar)
>
> 1. **Pedagogical Alignment:**
>    * All procedures must be written in **Indonesian**.
>    * The syntax steps (`Tahapan Sintaks`) under the `INTI` block must align 100% with the standard steps of the chosen `model_pembelajaran`. Do not mix steps from different models.
> 
> 2. **Formulation of Procedures:**
>    * The `Prosedur Guru` and `Prosedur Siswa` must behave like a mirror: if the teacher asks a question, the student must process or answer it.
>    * Keep the language active, concrete, and free of placeholders (do not use phrases like "Guru menjelaskan materi" without detailing *what* they explain).
> 
> 3. **Muatan Inovatif Integration:**
>    * Always include at least one differentiation strategy per meeting. Specify if it is Content (*Konten*), Process (*Proses*), or Product (*Produk*).
>    * Connect `Deep Learning` aspects explicitly to the students' prior knowledge or concrete real-world contexts.
> 
> 4. **Assessment Consistency:**
>    * Every meeting must have a diagnostic check at the start and a reflection check (exit ticket/journal) at the end.
>    * For `Formatif (Proses)` and `Formatif (Refleksi)`, define the specific rubrics or student self-reflection prompts under the `Lampiran Asesmen` column.
