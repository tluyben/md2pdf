const fs = require("fs");
const path = require("path");
const mdpdf = require('mdpdf');

const MAX_LINE_LENGTH = 150;

// Define the function to scan a directory for PHP files and extract substrings between balanced braces
async function scanDirectory(dir) {
    // Read the directory contents
    const files = fs.readdirSync(dir);

    let contents = ''
    // Iterate over each file in the directory
    for (const file of files) {
        // Construct the absolute path to the file
        const filePath = path.join(dir, file);

        // If the file is a directory, recursively scan it for PHP files
        if (fs.statSync(filePath).isDirectory()) {
            contents = await scanDirectory(filePath);
        }

        // read the file 
        const data = fs.readFileSync(filePath, 'utf8');
        contents += '\n\n## ' + data

    }
    return contents
}

// function to cut long lines into smaller lines
function cutLongLines(text) {
    let lines = text.split('\n');
    let newLines = [];
    for (let line of lines) {
        if (line.length > MAX_LINE_LENGTH) {
            let newLine = '';
            let words = line.split(' ');
            for (let word of words) {
                if (newLine.length + word.length > MAX_LINE_LENGTH) {
                    newLines.push(newLine);
                    newLine = '';
                }
                newLine += word + ' ';
            }
            newLines.push(newLine);
        } else {
            newLines.push(line);
        }
    }
    return newLines.join('\n');
}


// Get the directory path from the command line arguments
const dir = process.argv[2];

(async () => {
    // Scan the dir
    const result = cutLongLines(await scanDirectory(dir));


    // generate a random number
    const randomNumber = Math.floor(Math.random() * 1000000000) + 1;

    // write the result to a /tmp file with the random number
    const tmpFile = '/tmp/' + randomNumber + '.md'
    fs.writeFileSync(tmpFile, result);


    let options = {
        source: tmpFile,
        destination: path.join(__dirname, 'output.pdf'),
        //styles: path.join(__dirname, 'style.css'),
        pdf: {
            format: 'A4',
            //ghStyle: true,
            orientation: 'portrait'
        }
    };

    mdpdf.convert(options).then((pdfPath) => {
        console.log('PDF Path:', pdfPath);
    }).catch((err) => {
        console.error(err);
    });
    // console.log(result)
})()