const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Auto-install dependencies if node_modules is missing
if (!fs.existsSync(path.join(__dirname, 'node_modules', 'docx-templates'))) {
    console.log('Installing docx-templates locally via npm...');
    try {
        execSync('npm install docx-templates', { stdio: 'inherit', cwd: __dirname });
    } catch (e) {
        console.error('Failed to run npm install automatically. Please run: npm install docx-templates');
        process.exit(1);
    }
}

const { createReport } = require('docx-templates');

// File paths
const templatePath = path.join(__dirname, 'template.docx');
const dataPath = path.join(__dirname, 'data.json');
const defaultOutputPath = path.join(__dirname, 'output.docx');

if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template file not found at: ${templatePath}`);
    console.error(`Please make sure you copy your Word document to this path as 'template.docx'.`);
    process.exit(1);
}

if (!fs.existsSync(dataPath)) {
    console.error(`Error: Data file not found at: ${dataPath}`);
    process.exit(1);
}

async function main() {
    try {
        console.log('Loading template and JSON data...');
        const template = fs.readFileSync(templatePath);
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!data.tanggal_generasi) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const d = new Date();
            data.tanggal_generasi = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        }

        // Initialize all 9 school profile checkboxes
        const schoolValues = ['integrity', 'mindful', 'progressive', 'agility', 'compassion', 'tenacity', 'fidelity', 'uplifting', 'lifelong_learner'];
        schoolValues.forEach(val => {
            const key = `${val}_checked`;
            if (data[key] === undefined) {
                data[key] = false;
            }
        });

        // Inject 1-based sequential indices for formatting
        if (Array.isArray(data.sasaran_profil_sekolah)) {
            data.sasaran_profil_sekolah = data.sasaran_profil_sekolah.map((item, idx) => ({
                ...item,
                index: idx + 1
            }));
        }

        console.log('Rendering document...');
        const buffer = await createReport({
            template,
            data,
            cmdDelimiter: ['{', '}']
        });

        // Smart saving: Fallback to output(1).docx, output(2).docx, etc. if locked
        let finalOutputPath = defaultOutputPath;
        let counter = 1;
        while (true) {
            try {
                fs.writeFileSync(finalOutputPath, buffer);
                break;
            } catch (error) {
                if (error.code === 'EBUSY' || error.code === 'EPERM') {
                    const ext = path.extname(defaultOutputPath);
                    const base = path.basename(defaultOutputPath, ext);
                    const dir = path.dirname(defaultOutputPath);
                    finalOutputPath = path.join(dir, `${base}(${counter})${ext}`);
                    counter++;
                } else {
                    throw error;
                }
            }
        }

        console.log('Applying typography formatting (italics for math and English jargon)...');
        try {
            execSync(`python apply_formatting.py "${finalOutputPath}"`, { stdio: 'inherit', cwd: __dirname });
        } catch (err) {
            console.warn('Warning: Could not apply advanced formatting styles (make sure python is available).');
        }

        console.log(`\n==========================================`);
        console.log(`Success! Output document saved as:`);
        console.log(`-> ${finalOutputPath}`);
        console.log(`==========================================`);
    } catch (error) {
        console.error('Error generating document:', error);
        process.exit(1);
    }
}

main();
